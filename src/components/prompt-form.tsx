"use client";

import { Button } from "@/components/ui/button";
import { XmarkIcon } from "@/components/ui/icons";
import { FileInput } from "./file-input";
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useRef,
  useState,
  useEffect,
} from "react";
import { useEnterToSubmit } from "@/hooks/use-enter-to-submit";

interface PromptForm {
  setInput: Dispatch<SetStateAction<string>>;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  input: string;
  clearChats: () => void;
  triggerStop: () => void;
  isLoading: boolean;
  clearInput: () => void;
  interactWithFile?: boolean;
  setFile?: Dispatch<SetStateAction<File | any>> | undefined;
  file?: File | null | undefined;
}

export default function PromptForm({
  setInput,
  handleSubmit,
  input,
  clearChats,
  isLoading,
  interactWithFile,
  file,
  clearInput,
  setFile,
}: PromptForm) {
  const inputFormRef = useRef<React.ElementRef<"textarea">>(null);
  const promptFormRef = useRef<React.ElementRef<"form">>(null);
  const submitterButton = useRef<React.ElementRef<"button">>(null);
  const enterToSubmit = useEnterToSubmit(promptFormRef, submitterButton);

  useEffect(() => {
    inputFormRef.current?.focus();
    return () => {};
  }, []);

  return (
    <form
      className="relative h-max"
      ref={promptFormRef}
      onSubmit={handleSubmit}
      onKeyDown={enterToSubmit}
    >
      {interactWithFile && (
        <FileInput file={file && file} setFile={setFile && setFile} />
      )}
      <textarea
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setInput(e.target.value)
        }
        rows={1}
        cols={1}
        className="w-full resize-none rounded-md border p-2 pb-12 focus:outline-none"
        value={input}
        ref={inputFormRef}
        onInput={(event) => {
          event.currentTarget.setAttribute(
            "style",
            `height: ${event.currentTarget.scrollHeight}px !important;overflow-y:hidden`,
          );
        }}
      />
      <div className="absolute bottom-3 right-2 flex items-center space-x-1">
        <Button
          type="button"
          size="xs"
          variant="ghost"
          disabled={isLoading || input.length === 0}
          onClick={clearInput}
        >
          <XmarkIcon />
        </Button>
        <Button
          ref={submitterButton}
          type="submit"
          size="sm"
          disabled={isLoading || input.length === 0}
        >
          Send
        </Button>
      </div>
    </form>
  );
}
