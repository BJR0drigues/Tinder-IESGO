//bubblesort
function OrdenarPorAno(arr){
    for(let i = 0; i < arr.length - 1; i++){
        for(let j = 0; j < arr.length - 1; j++){
            if(arr[j].ano > arr[j + 1].ano){
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }     
    }
    return arr;
}

let livros = [    {titulo: "O Senhor dos Anéis", autor: "J.R.R. Tolkien", ano: 1954},
    {titulo: "1984", autor: "George Orwell", ano: 1949},
    {titulo: "O Grande Gatsby", autor: "F. Scott Fitzgerald", ano: 1925},
    {titulo: "Matar a Saudade", autor: "Carolina Maria de Jesus", ano: 1960},
    {titulo: "Dom Casmurro", autor: "Machado de Assis", ano: 1899}]

console.log("Livros ordenados por ano de publicação:");
OrdenarPorAno(livros);
console.log(livros);