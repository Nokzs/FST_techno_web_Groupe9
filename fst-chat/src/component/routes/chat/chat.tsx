import { Messages } from "./messages";
import { NavigationMessageMenu } from "./NavigationMessageMenu";
import { useFetcher, useParams } from "react-router-dom";
export function Chat() {
  const fetcher = useFetcher();
  const { channelId } = useParams<{ channelId: string }>();
  if(!channelId)return
  return (
    <div className="flex flex-row overflow-x-hidden  ">
      <NavigationMessageMenu channelId={channelId} fetcher={fetcher} />
      <Messages channelId={channelId} prefetchData={fetcher.data} />
    </div>
  );
}
