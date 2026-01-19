
import AddProductForm from "@/components/AddProductForm";
import AuthButton from "@/components/AuthButton";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { Bell, Icon, LogInIcon, Rabbit, Shield, TrendingDown } from "lucide-react";
import Image from "next/image";
import { getProducts } from "./auth/actions";
import ProductCard from "@/components/ProductCard";

export default async function Home() {
  const supabase=await createClient()

  const {data:{user},}=await supabase.auth.getUser()
  const products=user?await getProducts():[]

    const FEATURES = [
    {
      icon: Rabbit,
      title: "Lightning Fast",
      description:
        "Deal Drop extracts prices in seconds, handling JavaScript and dynamic content",
    },
    {
      icon: Shield,
      title: "Always Reliable",
      description:
        "Works across all major e-commerce sites with built-in anti-bot protection",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description: "Get notified instantly when prices drop below your target",
    },
  ];
  return (
   <main className="min-h-screen bg-black text-white">
    <header>
      <div className="">
        <div className="flex items-center gap-3">
          <Image height={600} width={400} src={'/Logo.png'} alt="PriceCrawler Logo"/>
      <AuthButton user={user}/>
     
        </div>
     
      </div>
    </header>
    <section className="py-20 px-4">
      <div className="flex md:flex-row flex-col text-left">
        <div className="flex flex-col  items-start justify-start">
         <p className="md:text-5xl font-bold text-4xl text-white">Never Miss a Price Drop</p> 
         <p className="md:text-2xl mt-2 text-xl text-white">Track prices from any e-commerce site.Get instant alerts when prices drop. Save money effortlessly</p> 
    <AddProductForm user={user}/>
        </div>
      </div>
    </section>
      {products.length===0&&(

    <section className="flex md:flex-row flex-col gap-3 items-center md:justify-center justify-start">
        {
          FEATURES.map(({icon:Icon,title,description})=>(
                  <div
                  key={title}
                  className="bg-neutral-500/20 backdrop-blur-2xl cursor-pointer p-6 rounded-xl border border-gray-200"
                >
                  <div className="w-12 h-12 bg-neutral-700 border-2 border-white/30 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="font-semibold text-white">{title}</h3>
                  <p className="text-sm  text-white">{description}</p>

                </div>
          ))
        }
    </section>
      )}

      {user && products.length>0 &&(
        <section className="max-w-7x mx-auto px-4 pb-20">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl">Your Tracked products </h3>
            <span className="text-sm text-gray-500">
              {products.length} {products.length===1?" product":"products"}
            </span>
          </div>
          <div className="grid gap-6 md:grid-cols-2 items-start">
            {products.map((product)=>(
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
      {user && products.length===0 &&(
             <section className="max-w-2xl mt-10 mx-auto px-4 pb-20 text-center">
          <div className="bg-neutral-700/50 backdrop-blur-2xl rounded-xl border-2 border-dashed border-gray-300 p-12">
            <TrendingDown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No products yet
            </h3>
            <p className="text-gray-200">
              Add your first product above to start tracking prices!
            </p>
          </div>
        </section> 
      ) }

   </main>
  );
}
