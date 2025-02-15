import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  

  function CommonCard({title, icon, description, footerContent}){
    return(
        <Card className="flex bg-gray-100 flex-col gap-6 rounded-2xl p-8 transition duration-300
         hover:bg-white hover:shadow-2xl hover: shadow-gray-900 cursor-pointer w-50
         border-4 border-gray-950 sm:w-[320px] sm:mt-10 sm:gap-10 md:w-[300px] md:mt-10 lg:w-[350px] lg:mt-10 justify-evenly overflow-auto">
            <CardHeader className="p-0">
                {
                    icon? icon :null
                }
                {
                    title? <CardTitle className="text-xl max-w-[500] text-ellipsis overflow-hidden whitespace-nowrap font-semibold text-gray-950">
                        {title}
                        </CardTitle> :null
                }
                {
                    description ?
                    <CardDescription className="mt-3 text-gray-600">{description}</CardDescription>:null
                }
            </CardHeader>
            <CardFooter className="p-0">
                {footerContent}
            </CardFooter>

        </Card>
    )
  }


  export default CommonCard