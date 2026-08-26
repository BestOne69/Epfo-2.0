export type Passbook={employeeShare:number;employerShare:number;interest:number;eps:number}; export const withdrawablePF=(p:Passbook)=>p.employeeShare+p.employerShare+p.interest;
