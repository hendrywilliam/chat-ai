import * as React from "react";
import { UseChatHelpers } from "@/types";
import { IconUser } from "@/components/icons/icon-user";
import { OpenAIIcon } from "@/components/ui/icons";
import { ChatAction } from "@/components/chat-action";
import ReactMarkdown from "react-markdown";
import { Code } from "@/components/code";

interface ChatMessageProps extends Pick<UseChatHelpers, "messages"> {}

export function ChatMessage({ messages }: ChatMessageProps) {
  return (
    <>
      {messages.map((item) => {
        return (
          <div
            id="chat-wrapper"
            className="relative flex w-full h-max py-6 gap-2 xl:gap-6"
            key={item.id}
          >
            <div id="chat-role" className="w-8">
              {item.role === "user" ? (
                <div className="inline-flex justify-center items-center w-8 h-8 border rounded-md shadow">
                  <IconUser />
                </div>
              ) : (
                <div className="inline-flex justify-center items-center w-8 h-8 border rounded-md shadow bg-black">
                  <OpenAIIcon fill="white" />
                </div>
              )}
            </div>
            <div
              id="chat-content"
              className="w-[80%] first:mb-2 last:mt-2 leading-relaxed box-border"
            >
              {/* eslint-disable */}
              <ReactMarkdown
                children={item.content}
                className="w-full break-words"
                components={{
                  pre({ children }) {
                    return <pre className="w-full">{children}</pre>;
                  },
                  p({ children }) {
                    return <p className="w-full mb-4">{children}</p>;
                  },
                  li({ children }) {
                    return <li className="mb-1">{children}</li>;
                  },
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <Code language={match[0].split("-")[1]} {...props}>
                        {children}
                      </Code>
                    ) : (
                      <code className="font-extrabold">"{children}"</code>
                    );
                  },
                }}
              />
            </div>
            <ChatAction message={item.content} />
          </div>
        );
      })}
    </>
  );
}
