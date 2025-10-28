import { Messages } from "./messages";
import { NavigationMessageMenu } from "./NavigationMessageMenu";
import { useFetcher, useParams } from "react-router-dom";
export function Chat() {
  const fetcher = useFetcher();
  console.log("les données sont", fetcher.data);
  const { channelId } = useParams<{ channelId: string }>();
  return (
    <div className="flex flex-row">
      <NavigationMessageMenu channelId={channelId} fetcher={fetcher} />
      <Messages channelId={channelId} prefetchData={fetcher.data} />
    </div>
  );
}
