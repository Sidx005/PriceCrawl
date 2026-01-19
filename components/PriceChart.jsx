'use client';
import { getPriceHistory } from '@/app/auth/actions';
import React, { useEffect, useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';

const PriceChart = ({productId}) => {
  const [data,setData]=useState([]);
  useEffect(()=>{
   const fetchData=async()=>{
    try {
      const res=await getPriceHistory(productId);
      if(res.error){
        setData([]);
        // toast.error(res.error);
        return;
      }else{
        console.log("Price history data:", res);
        // setData([10000,20000,15000,30000,25000,40000,35000].map((price,index)=>({date:`Day ${index+1}`,price})));
        // setData(res.data||[]);
      }

    } catch (error) {
      console.error("Error fetching price history:", error);
      toast.error("Failed to fetch price history");
    }
   }

  if (productId) {
    fetchData(); // ✅ THIS WAS MISSING
  }

},[productId])
  return (
   <ResponsiveContainer  width="100%" height={300}>
    <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis dataKey={'price'} tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#FA5D19"
            strokeWidth={2}
            dot={{ fill: "#FA5D19", r: 4 }}
            activeDot={{ r: 6 }}
          />
          </LineChart>
    </ResponsiveContainer>
  )
}

export default PriceChart