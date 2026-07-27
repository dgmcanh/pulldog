import { getBoardData, getFilters } from "@/features/pull-board/actions";
import { PullBoard } from "@/features/pull-board/pull-board";

export default async function Home() {
  const [boardData, filters] = await Promise.all([
    getBoardData(),
    getFilters(),
  ]);

  return <PullBoard initialData={boardData} filters={filters} />;
}
