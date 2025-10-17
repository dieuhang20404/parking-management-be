import { ReturnData } from "../configs/interface";

const serviceError: ReturnData = {
    message: "Xảy ra lỗi ở service",
    data: false,
    code: -1
}

export const testApiService = () => {
    return("abcd");
}