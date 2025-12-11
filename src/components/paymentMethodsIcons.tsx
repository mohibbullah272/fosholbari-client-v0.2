import bkash from '../../asset/BKash_Logo_icon.svg'
import nogod from '../../asset/Nagad-Logo.wine.svg'
import rocket from '../../asset/dutch-bangla-rocket-seeklogo.png'
import upay from '../../asset/upay-seeklogo.png'
import ucb from '../../asset/ucb-bank-seeklogo.png'
import bank from '../../asset/bank.jpg'
import React from 'react';
import Image from 'next/image'
import { Smartphone } from 'lucide-react'



const getIcons = (iconName: string) => {
  if(iconName ==="বিকাশ" || iconName ==="BKASH"){
    return <Image src={bkash} alt="bkash" width={40} height={40} />;
  }
 else if(iconName === "নগদ" || iconName ==="NAGAD"){
    return  <Image src={nogod} alt="nagad" width={40} height={40} />;
  }
  else if(iconName === "ব্যাংক" || iconName ==="BANK"){
    return <Image src={bank} alt="bank" width={40} height={40} />;
  }
  else if(iconName === "উপায়" || iconName ==="UPAY"){
    return <Image src={upay} alt="upay" width={40} height={40} />;
  }
  else if(iconName === "রকেট" || iconName ==="ROCKET"){
    return <Image src={rocket} alt="rocket" width={40} height={40} />;
  
  }
  else if(iconName ==="ইউসিবি" || iconName ==="UCB"){
    return <Image src={ucb} alt="ucb" width={40} height={40} />;
  }
  else {
    return <Smartphone className="w-6 h-6" />;
  }
  
    // switch (iconName) {
    //   case "বিকাশ" :
  
    //     return <Image src={bkash} alt="bkash" width={40} height={40} />;

    //   case "নগদ":
    //     return <Image src={nogod} alt="nagad" width={40} height={40} />;
  
    //   case "ব্যাংক":
    //     return <Image src={bank} alt="bank" width={40} height={40} />;
  
    //   case "উপায়":
    //     return <Image src={upay} alt="upay" width={40} height={40} />;
  
    //   case "রকেট":
    //     return <Image src={rocket} alt="rocket" width={40} height={40} />;
  
    //   case "ইউসিবি":
    //     return <Image src={ucb} alt="ucb" width={40} height={40} />;
  
    //   default:
    //     return <Smartphone className="w-6 h-6" />;
    // }
  };

  export default getIcons
  



