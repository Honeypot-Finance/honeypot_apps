declare type ApiResponseType<T extends any> =
   {
      status: "success";
      data: T
      message: string;
    } | {
      status: "error";
      message: string;
    }
