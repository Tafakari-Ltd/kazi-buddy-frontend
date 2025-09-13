interface IEmployer {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    industry: string;
    employees: number;
    status: "Active" | "Inactive";
}

export type { IEmployer }