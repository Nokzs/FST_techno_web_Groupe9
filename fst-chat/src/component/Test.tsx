import type { ReactElement } from "react";

type prop = {
    message: string;
    message2: string | number | undefined;
}
export function Test({message,message2}:prop):ReactElement  {
    return (<div>{message} et {message2 ?? "toto"}</div>);
}
