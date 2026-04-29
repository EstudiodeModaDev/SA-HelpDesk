export type Categoria = {
    ID: string;
    Title: string
}

export type SubCategoria = {
    ID: string;
    Title: string;
    Id_Categoria: string
}

export type ANS = {
    Id: string
    Title: string;
    CategoriaId: string;
    SubCategoriaId: string;
    ArticuloId: string
}