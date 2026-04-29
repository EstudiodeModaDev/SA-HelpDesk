export type SharePointGroup = {
  Id: number;
  Title: string;
  Description?: string;
};

export type SharePointUser = {
  Id: number;
  Title: string;
  Email?: string;
  LoginName: string;
};

export type AppGroupUser = {
  spUserId: number;
  nombre: string;
  correo: string;
  loginName: string;
};

export type AppSharePointGroup = {
  id: number;
  title: string;
  description?: string;
};


//Customs

export type newAccess = {
  mail: string;
  name: string
}