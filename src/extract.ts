
export default function extract( inputText:string):string[]|undefined{

    const regex = /Marks(.*?)www\./;  // Regular expression to match text between "Marks" and "www."
    const match = inputText.match(regex);
    
    if (match) {
    return match[1].trim().split(" ").filter((l)=>isNaN(Number(l)))  // Extract and trim the matched content
    } else {
        console.log("No match found");
    }


}



    
