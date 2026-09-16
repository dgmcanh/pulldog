import { Skeleton } from "@/components/ui/skeleton";
import { Header, Main, Sidebar } from "@/lib/ui/board-shell";

export default function Loading() {
  return (
    <>
      <Header className="sticky top-0 z-10" disabled />
      <div className="mx-auto grid max-w-screen-xl grid-cols-[auto_1fr] gap-6 px-3">
        <Sidebar className="max-w-[400px] min-w-[300px] pt-8">
          <ul>
            <div className="flex flex-row items-center gap-2">
              <Skeleton className="h-[22px] w-[50px] rounded-full" />
              <Skeleton className="h-[16px] w-[60px] rounded-md" />
            </div>
            <div className="mt-2 flex flex-row items-center gap-2">
              <Skeleton className="h-[22px] w-[50px] rounded-full" />
              <Skeleton className="h-[16px] w-[70px] rounded-md" />
            </div>
          </ul>

          <div className="mt-6 flex flex-col gap-2">
            <Skeleton className="h-[14px] w-[120px] rounded-full" />
            <Skeleton className="h-[12px] w-[70px] rounded-md" />
            <Skeleton className="h-[12px] w-[150px] rounded-md" />
            <Skeleton className="h-[12px] w-[140px] rounded-md" />
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <Skeleton className="h-[14px] w-[100px] rounded-full" />
            <Skeleton className="h-[12px] w-[70px] rounded-md" />
            <Skeleton className="h-[12px] w-[140px] rounded-md" />
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <Skeleton className="h-[14px] w-[110px] rounded-full" />
            <Skeleton className="h-[12px] w-[70px] rounded-md" />
            <Skeleton className="h-[12px] w-[150px] rounded-md" />
          </div>
        </Sidebar>
        <Main>
          <div className="flex flex-col gap-1">
            <div className="flex flex-row items-center gap-2">
              <Skeleton className="h-[32px] w-[32px] rounded-full" />
              <Skeleton className="h-[16px] w-[200px] rounded-md" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="mt-2 flex flex-row items-center gap-4">
                <Skeleton className="h-[20px] w-[20px] rounded-md ml-1" />
                <Skeleton className="h-[16px] w-[400px] rounded-md" />
              </div>
              <Skeleton className="h-[10px] w-[110px] rounded-full ml-10" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="mt-2 flex flex-row items-center gap-4">
                <Skeleton className="h-[20px] w-[20px] rounded-md ml-1" />
                <Skeleton className="h-[16px] w-[300px] rounded-md" />
              </div>
              <Skeleton className="h-[10px] w-[170px] rounded-full ml-10" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="mt-2 flex flex-row items-center gap-4">
                <Skeleton className="h-[20px] w-[20px] rounded-md ml-1" />
                <Skeleton className="h-[16px] w-[250px] rounded-md" />
              </div>
              <Skeleton className="h-[10px] w-[110px] rounded-full ml-10" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="mt-2 flex flex-row items-center gap-4">
                <Skeleton className="h-[20px] w-[20px] rounded-md ml-1" />
                <Skeleton className="h-[16px] w-[500px] rounded-md" />
              </div>
              <Skeleton className="h-[10px] w-[90px] rounded-full ml-10" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="mt-2 flex flex-row items-center gap-4">
                <Skeleton className="h-[20px] w-[20px] rounded-md ml-1" />
                <Skeleton className="h-[16px] w-[200px] rounded-md" />
              </div>
              <Skeleton className="h-[10px] w-[100px] rounded-full ml-10" />
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-1">
            <div className="flex flex-row items-center gap-2">
              <Skeleton className="h-[32px] w-[32px] rounded-full" />
              <Skeleton className="h-[16px] w-[200px] rounded-md" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="mt-2 flex flex-row items-center gap-4">
                <Skeleton className="h-[20px] w-[20px] rounded-md ml-1" />
                <Skeleton className="h-[16px] w-[400px] rounded-md" />
              </div>
              <Skeleton className="h-[10px] w-[110px] rounded-full ml-10" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="mt-2 flex flex-row items-center gap-4">
                <Skeleton className="h-[20px] w-[20px] rounded-md ml-1" />
                <Skeleton className="h-[16px] w-[300px] rounded-md" />
              </div>
              <Skeleton className="h-[10px] w-[170px] rounded-full ml-10" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="mt-2 flex flex-row items-center gap-4">
                <Skeleton className="h-[20px] w-[20px] rounded-md ml-1" />
                <Skeleton className="h-[16px] w-[250px] rounded-md" />
              </div>
              <Skeleton className="h-[10px] w-[110px] rounded-full ml-10" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="mt-2 flex flex-row items-center gap-4">
                <Skeleton className="h-[20px] w-[20px] rounded-md ml-1" />
                <Skeleton className="h-[16px] w-[500px] rounded-md" />
              </div>
              <Skeleton className="h-[10px] w-[90px] rounded-full ml-10" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="mt-2 flex flex-row items-center gap-4">
                <Skeleton className="h-[20px] w-[20px] rounded-md ml-1" />
                <Skeleton className="h-[16px] w-[200px] rounded-md" />
              </div>
              <Skeleton className="h-[10px] w-[100px] rounded-full ml-10" />
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-1">
            <div className="flex flex-row items-center gap-2">
              <Skeleton className="h-[32px] w-[32px] rounded-full" />
              <Skeleton className="h-[16px] w-[200px] rounded-md" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="mt-2 flex flex-row items-center gap-4">
                <Skeleton className="h-[20px] w-[20px] rounded-md ml-1" />
                <Skeleton className="h-[16px] w-[400px] rounded-md" />
              </div>
              <Skeleton className="h-[10px] w-[110px] rounded-full ml-10" />
            </div>
          </div>
        </Main>
      </div>
    </>
  );
}
