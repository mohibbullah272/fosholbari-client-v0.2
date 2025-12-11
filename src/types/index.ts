export interface IProject {
  id: number;
  name: string;
  description: string;
  image: string[];
  totalShare: string;
  sharePrice: string;
  profitPerShare: string;
  expireDate: string;
  Duration: string;
  location: string;
  progressUpdateImage: string[];
  progressUpdate: string[];
  progressUpdateDate: string[];
  createdAt: string;
  updateAt: string;
  category: string;
  keywords: string[];
  estimatedROI?: number;
  roiCalculation?: string;
  Investment?: any[];
  payment?: any[];
}

export type SortOption = 'createdAt' | 'sharePrice' | 'expireDate' | 'estimatedROI';
export type SortOrder = 'asc' | 'desc';
export type DurationFilter = 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM' | 'ALL';


  export interface ProgressUpdateData {
    progressUpdateImage: string[];
    progressUpdate: string[];
    progressUpdateDate: string[];
  }
  
  export interface ProjectsResponse {
    success: boolean;
    message: string;
    data: IProject[];
  }


  // types/payment.ts
export enum PaymentMethods {
  BKASH = 'BKASH',
  NAGAD = 'NAGAD',
  ROCKET = 'ROCKET',
  UPAY = 'UPAY',
  BANK = 'BANK',
  UCB = 'UCB'
}

export interface PaymentMethod {
  id: number;
  methodName: PaymentMethods;
  number: string;
  accountName: string;
  instruction: string;
}

export interface CreatePaymentMethodData {
  methodName: PaymentMethods;
  number: string;
  accountName: string;
  instruction: string;
}




export interface UpdatePaymentMethodData extends Partial<CreatePaymentMethodData> {}
export interface Investment {
  id: number;
  userId: number;
  projectId: number;
  shareBought: number;
  totalAmount: number;

  method: string;
  paymentNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    phone: string;
  };
  project: {
    name: string;
  };
}

export interface InvestmentDetails extends Investment {
  project: IProject;
}



export interface UserStats {
  myProject: number;
  totalInvestment: {
    _sum: {
      amount: number;
    };
  };
  totalShareBought: {
    _sum: {
      shareBought: number;
    };
  };
  isVerified: {
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
  };
}

export interface RecentProject {
  id: number;
  userId: number;
  projectId: number;
  method: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  user: {
    name: string;
    phone: string;
  };
  project: {
    name: string;
    image: string[];
  };
}

export interface UserDashboardData {
  stats: UserStats;
  myRecentProject: RecentProject[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}


export interface ProjectProgress {
  id: number;
  userId: number;
  projectId: number;
  method: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  project: {
    name: string;
    progressUpdate: string[];
    progressUpdateImage: string[];
    progressUpdateDate: string[];
  };
}

export interface ProjectProgressResponse {
  success: boolean;
  message: string;
  data: ProjectProgress[];
}