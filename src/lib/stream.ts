import type { ChatCompletionChunk } from "openai/resources/index.mjs";

/** Generate artificial stream */
export function createFakeStream(
  generator: AsyncGenerator,
  signal: AbortSignal,
): ReadableStream {
  return new ReadableStream({
    async start(controller) {},
    async pull(controller) {
      while (true) {
        /** Server should respect aborts from client. It changes signal.aborted state to true. */
        signal.addEventListener("abort", () => {
          console.log("Request aborted.");
        });

        const { value, done } = await generator.next();
        if (done || signal.aborted) {
          controller.close();
          break;
        } else {
          controller.enqueue(value);
        }
      }
    },
    async cancel(reason) {},
  });
}

export async function* chatCompletionGenerator(
  snapshots: ChatCompletionChunk[],
  timeout: number = 100,
) {
  for await (const snapshot of snapshots) {
    yield new Promise((resolve, reject) =>
      /** Add timeout so it looks like it needs time to generate a result. */
      setTimeout(() => {
        resolve(`${JSON.stringify(snapshot)}\n`);
      }, timeout),
    );
  }
}

export const experimental_chatCompletionGenerator = async function* (
  snapshots: ChatCompletionChunk[],
  timeout: number = 200,
) {
  for await (const snapshot of snapshots) {
    yield new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(JSON.stringify(snapshot));
      }, timeout);
    });
  }
};

/** Piping operation between two stream: Readable and Transform. */
export const experimental_compositeStream = function (
  generator: AsyncGenerator,
): ReadableStream {
  const queueStrat = new CountQueuingStrategy({
    highWaterMark: 5,
  });

  const readableStream = new ReadableStream(
    {
      async start(controller) {
        console.log("ReadableStream initialized.");
      },
      async pull(controller) {
        while (true) {
          const { value, done } = await generator.next();
          if (done) {
            controller.close();
          }
          controller.enqueue(value);
        }
      },
      cancel(reason) {
        console.log("Stream canceled. Reason: ", reason);
      },
    },
    queueStrat,
  );

  const transformStream = new TransformStream({
    transform(chunk, controller) {
      controller.enqueue(`${chunk}\n`);
    },
    flush(controller) {
      controller.terminate();
    },
  });

  return readableStream.pipeThrough(transformStream);
};

/** @param generator is an object that applies iterator protocol. */
export const experimental_StreamingResponse = function (
  generator: AsyncGenerator,
  transformer?: () => void,
) {
  return new Response(
    new ReadableStream({
      async start() {},
      async pull(controller) {
        while (true) {
          const { value, done } = await generator.next();

          if (done) {
            controller.close();
            break;
          }
          /**
           * @todo We should get the answer only, not including the context and history.
           * In this workaround we are accessing answer property, which only exist in answer response.
           * Accessing "answer" property in an object that has no corresponding property will return undefined.
           */
          const answer = (value as any).answer ?? "";
          controller.enqueue(`{ "answer":${JSON.stringify(answer)} }\n`);
        }
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
      },
      status: 200,
      statusText: "Streaming data in chunks.",
    },
  );
};
