import { Messages } from "./messages";
import { NavigationMessageMenu } from "./NavigationMessageMenu";
import { useParams } from "react-router-dom";
export function Chat() {
  const { channelId } = useParams<{ channelId: string }>();
  return (
    <div className="flex flex-row">
      <NavigationMessageMenu channelId={channelId} />
      <Messages channelId={channelId} />
    </div>
  );
}
