import bkash from '../../../asset/BKash_Logo_icon.svg'
import nogod from '../../../asset/Nagad-Logo.wine.svg'
import rocket from '../../../asset/dutch-bangla-rocket-seeklogo.png'
import upay from '../../../asset/upay-seeklogo.png'
import ucb from '../../../asset/ucb-bank-seeklogo.png'
import bank from '../../../asset/bank.jpg'
import React from 'react';
import Image from 'next/image'
import { Smartphone } from 'lucide-react'



const getIcons = (iconName: string) => {
    switch (iconName) {
      case "বিকাশ":
        return <Image src={bkash} alt="bkash" width={40} height={40} />;
  
      case "নগদ":
        return <Image src={nogod} alt="nagad" width={40} height={40} />;
  
      case "ব্যাংক":
        return <Image src={bank} alt="bank" width={40} height={40} />;
  
      case "উপায়":
        return <Image src={upay} alt="upay" width={40} height={40} />;
  
      case "রকেট":
        return <Image src={rocket} alt="rocket" width={40} height={40} />;
  
      case "ইউসিবি":
        return <Image src={ucb} alt="ucb" width={40} height={40} />;
  
      default:
        return <Smartphone className="w-6 h-6" />;
    }
  };

  export default getIcons
  



