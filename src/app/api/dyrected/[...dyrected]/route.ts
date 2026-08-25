import config from "../../../../../dyrected.config";
import { dyrectedNextHandler } from "@dyrected/next/handler";

export const { GET, POST, PATCH, DELETE, PUT, OPTIONS } = dyrectedNextHandler(config, {
  basePath: "/api/dyrected",
});
