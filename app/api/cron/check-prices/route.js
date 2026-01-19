import { sendPriceDropAlert } from "@/lib/email";
import { scrapeProduct } from "@/lib/firecrawl";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async  function GET(){
    console.log("This isnextresponse",NextResponse);
    return NextResponse.json({
        message:'Price checking endpoint is working. Use POST to check prices.'
    })
}

export async function POST(req){
    try {
        const authHeader=req.headers.get("authorization");
        const cronSecret=process.env.CRON_SECRET
        if(authHeader!==`Bearer ${cronSecret}`||!cronSecret){
            return NextResponse.json({error:"Unauthorized"},{status:401});
        }

        const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY)

        const {data:products,error:productsError}=await supabase.from("products").select('*');
        if(productsError) throw productsError;


        const results={
            totalLength:products.length,
            updated:0,
            failed:0,
            priceChanges:0,
            alertSent:0
        }
        for(const product of products){
            try {
                const res=await scrapeProduct(product.url)
                if(!res.currentPrice){
                    console.log(`Failed to scrape price for product ID ${product.id} at URL ${product.url}`);
                    results.failed++;
                    continue;
                }
                const newPrice=parseFloat(res.currentPrice);
                const oldPrice=parseFloat(product.current_price);
                (await supabase).from("products").update({
                current_price: newPrice,
            currency: productData.currencyCode || product.currency,
            name: productData.productName || product.name,
            image_url: productData.productImageUrl || product.image_url,
            updated_at: new Date().toISOString(),
                })
                if(newPrice!==oldPrice){
                    (await supabase).from('price_history').insert({
                        product_id:product.id,
                        price:newPrice,
                        currency:res.currencyCode||product.currency
                    })
                    results.priceChanges++;

                    if(newPrice<oldPrice){
                        //Send alert to user
                        const{data:user}=(await supabase).auth.admin.getUserById(product.user_id);
                        if(user?.email){
                            //Send email
                            const emailRes=await sendPriceDropAlert(
                                user.email,
                                product,
                                oldPrice,
                                newPrice
                            )
                            if(emailRes.success){
                                results.alertSent++;
                            }
                    }
                }
results.updated++;
                }

            } catch (error) {
                  console.error(`Error processing product ${product.id}:`, error);
        results.failed++;
            }
        }
          return NextResponse.json({
      success: true,
      message: "Price check completed",
      results,
    });
    } catch (error) {
          console.error("Cron job error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 }); 
    }

}