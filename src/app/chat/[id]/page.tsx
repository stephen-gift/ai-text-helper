import React from "react";

const ChatPage = ({ params }: { params: { id: string } }) => {
  return <div>Chat Page - ID: {params.id}</div>;
};

export default ChatPage;
