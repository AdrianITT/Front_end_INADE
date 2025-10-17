//

import { Api_Host } from "../api";

export function getBanxicoFixRange(from, to, serie = "SF43718") {
  return Api_Host.get("/banxico/fix-range/", {
    params: { from, to, serie },
  });
}