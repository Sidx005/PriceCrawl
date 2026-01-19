"use server"
import { scrapeProduct } from "@/lib/firecrawl";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signOut(params) {
    const supabase=await createClient();
    await supabase.auth.signOut();
    revalidatePath("/");
    redirect("/");
}

export async function addProduct(formData){
    const url=formData.get("url");

    if(!url){
        return {error:"URL is required"}
    }
    try {
       const supbase= await createClient();
       const {data:{user}}=await supbase.auth.getUser();
       if(!user){
        return {error:"Not  authenticated"}
       }
       const productData=await scrapeProduct(url);
       if(!productData.productName || !productData.currentPrice){
            console.log("Scraped data:", productData);
            return {error:"Failed to extract product data from the provided URL."}
       }
       const newPrice=parseFloat(productData.currentPrice);
       const currency=productData.currencycode||"USD";

       const {data:existingProduct}=await supbase.from("products").select("user_id",user.id).eq("url",url).single();


       const isUpdate=!!existingProduct

       //Upsert product
       const {data:product,error}=await supbase.from("products").upsert({
        user_id:user.id,
        url,
        name:productData.productName,
        current_price:newPrice,
        currency,
        image_url:productData.productImageUrl,
        updated_at:new Date().toISOString()
       },{
        onConflict:"user_id,url",//Unique constraint on user_id+ url
        ignoreDuplicates:false,//Always update if exists
       }).select().single();
       if(error) throw error;
       const shouldAddHistory=!isUpdate||!existingProduct.current_price!==newPrice;
       if(shouldAddHistory){
        await supbase.from("price_history").insert({
            product_id:product.id,
            price:newPrice,
            currency:currency

        })
       }
       revalidatePath("/");
       return{
        success:true,
        product,
        message:isUpdate?"Product updated with latest price!":"Product added successfully!"
       }
    } catch (error) {
        console.error("Error adding product:", error);
        return {error:"Failed to add product."}
    }
}

export async function deleteProduct(productId){
    try {
        //createClient is a server-side function to create a supabase client 
        const supabase=await createClient();
        const {data:{user}}=await supabase.auth.getUser();
        if(!user){
            return {error:"Not authenticated"};

        }
        const {error}=await supabase.from("products").delete().eq("id",productId);
        if(error) throw error;
        revalidatePath("/");
        return {success:true};

    } catch (error) {
        return {error:error.message}
    }
}


export async function getProducts() {
    try {
        const supabase=await createClient();
        const {data,error}=await supabase.from("products").select('*').order('created_at',{ascending:false});
        if(error) throw error;
        return data||[]; 
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }

}
export async function getProductHistory(productId) {
  try {
    const supabase=await createClient();
    const {data,error}=await supabase.from("price_history").select('*');
    if(error) throw error;
    return data||[];
} catch (error) {
    console.error("Get price history error:",error);
    return [];
}  
}

export async function getPriceHistory(productId){
    try {
        const supabase=await createClient();
        const{data,error}=await supabase.from("price_history").select("*").eq("product_id",productId).order("checked_at",{ascending:true});
        
    if (error) throw error;
    return data || [];

    } catch (error) {
            console.error("Get price history error:", error);
    return [];
    }
}