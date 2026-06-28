import { SteamGame } from "@/types";
import GameCard from "./GameCard";

interface GameListProps {
  games: SteamGame[];
}

export default function GameList({ games }: GameListProps) {
  if (games.length === 0) {
    return (
      <div className="text-center py-12 text-[#4a6580]">
        <p>No games in this list.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {games.map((game, idx) => (
        <GameCard key={game.steam_id} game={game} index={idx} />
      ))}
    </div>
  );
}
