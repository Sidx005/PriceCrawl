import Firecrawl from "@mendable/firecrawl-js";

const firecrawl=new Firecrawl({apiKey: process.env.FIRECRAWL_API_KEY});

export async function scrapeProduct(url){
    try {
        const result=await firecrawl.scrape(url,{
            formats:[{type:'json',prompt:'',"schema": {
        "type": "object",
        "required": [
          "productName",
          "currentPrice"
        ],
        "properties": {
          "productName": {
            "type": "string"
          },
          "currentPrice": {
            "type": "number"
          },
          "currencyCode": {
            "type": "string"
          },
          "productImageUrl": {
            "type": "string"
          }
        }
      },
      "prompt": "Extract product name as 'productName', price as 'currentPrice', currency as 'currencyCode', and image URL as 'productImageUrl' if available."
    }
  ]
        });
        const extractedData=result.json;
        if(!extractedData || !extractedData.productName){
            throw new Error('No data extracted from URL');
        }
        return extractedData;
    } catch (error) {
        console.error("Firecrawl scrape error:",error);
        throw new Error(`Failed to scrape product: ${error.message}`);
    }
    }