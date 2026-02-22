export interface Player {
  id: string;
  name: string;
  age: number;
  position: string;
  contractValue: number;
  aiScore: number;
}

export interface TeamData {
  id: string;
  name: string;
  abbreviation: string;
  conference: "Eastern" | "Western";
  players: Player[];
  aiRecommendation: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const mockResponses: Record<string, string[]> = {
  default: [
    "Based on my analysis, I'd prioritize protecting players with high contract efficiency (value score vs. salary ratio). Your current selections look solid.",
    "Looking at league-wide trends, teams that protect younger core players tend to fare better post-expansion. Consider the long-term trajectory.",
    "The expansion team will likely target veteran role players on team-friendly deals. Make sure your key rotation pieces are covered.",
    "I'd recommend running a few different protection scenarios. Sometimes the obvious choices aren't the optimal ones from a cap perspective.",
  ],
};

export function getMockResponse(_teamId: string, _question: string): string {
  const responses = mockResponses.default;
  return responses[Math.floor(Math.random() * responses.length)];
}

export const allTeams: { id: string; name: string; abbreviation: string; conference: "Eastern" | "Western" }[] = [
  { id: "atl", name: "Atlanta Hawks", abbreviation: "ATL", conference: "Eastern" },
  { id: "bos", name: "Boston Celtics", abbreviation: "BOS", conference: "Eastern" },
  { id: "bkn", name: "Brooklyn Nets", abbreviation: "BKN", conference: "Eastern" },
  { id: "cha", name: "Charlotte Hornets", abbreviation: "CHA", conference: "Eastern" },
  { id: "chi", name: "Chicago Bulls", abbreviation: "CHI", conference: "Eastern" },
  { id: "cle", name: "Cleveland Cavaliers", abbreviation: "CLE", conference: "Eastern" },
  { id: "dal", name: "Dallas Mavericks", abbreviation: "DAL", conference: "Western" },
  { id: "den", name: "Denver Nuggets", abbreviation: "DEN", conference: "Western" },
  { id: "det", name: "Detroit Pistons", abbreviation: "DET", conference: "Eastern" },
  { id: "gsw", name: "Golden State Warriors", abbreviation: "GSW", conference: "Western" },
  { id: "hou", name: "Houston Rockets", abbreviation: "HOU", conference: "Western" },
  { id: "ind", name: "Indiana Pacers", abbreviation: "IND", conference: "Eastern" },
  { id: "lac", name: "LA Clippers", abbreviation: "LAC", conference: "Western" },
  { id: "lal", name: "Los Angeles Lakers", abbreviation: "LAL", conference: "Western" },
  { id: "mem", name: "Memphis Grizzlies", abbreviation: "MEM", conference: "Western" },
  { id: "mia", name: "Miami Heat", abbreviation: "MIA", conference: "Eastern" },
  { id: "mil", name: "Milwaukee Bucks", abbreviation: "MIL", conference: "Eastern" },
  { id: "min", name: "Minnesota Timberwolves", abbreviation: "MIN", conference: "Western" },
  { id: "nop", name: "New Orleans Pelicans", abbreviation: "NOP", conference: "Western" },
  { id: "nyk", name: "New York Knicks", abbreviation: "NYK", conference: "Eastern" },
  { id: "okc", name: "Oklahoma City Thunder", abbreviation: "OKC", conference: "Western" },
  { id: "orl", name: "Orlando Magic", abbreviation: "ORL", conference: "Eastern" },
  { id: "phi", name: "Philadelphia 76ers", abbreviation: "PHI", conference: "Eastern" },
  { id: "phx", name: "Phoenix Suns", abbreviation: "PHX", conference: "Western" },
  { id: "por", name: "Portland Trail Blazers", abbreviation: "POR", conference: "Western" },
  { id: "sac", name: "Sacramento Kings", abbreviation: "SAC", conference: "Western" },
  { id: "sas", name: "San Antonio Spurs", abbreviation: "SAS", conference: "Western" },
  { id: "tor", name: "Toronto Raptors", abbreviation: "TOR", conference: "Eastern" },
  { id: "uta", name: "Utah Jazz", abbreviation: "UTA", conference: "Western" },
  { id: "was", name: "Washington Wizards", abbreviation: "WAS", conference: "Eastern" },
];

export const teamData: Record<string, TeamData> = {
  chi: {
    id: "chi",
    name: "Chicago Bulls",
    abbreviation: "CHI",
    conference: "Eastern",
    players: [
      { id: "chi-1", name: "Zach LaVine", age: 29, position: "SG", contractValue: 43000000, aiScore: 72 },
      { id: "chi-2", name: "DeMar DeRozan", age: 35, position: "SF", contractValue: 28600000, aiScore: 65 },
      { id: "chi-3", name: "Nikola Vučević", age: 33, position: "C", contractValue: 20000000, aiScore: 58 },
      { id: "chi-4", name: "Patrick Williams", age: 23, position: "PF", contractValue: 12500000, aiScore: 74 },
      { id: "chi-5", name: "Coby White", age: 24, position: "PG", contractValue: 12400000, aiScore: 78 },
      { id: "chi-6", name: "Ayo Dosunmu", age: 24, position: "SG", contractValue: 8700000, aiScore: 82 },
      { id: "chi-7", name: "Alex Caruso", age: 30, position: "SG", contractValue: 9600000, aiScore: 76 },
      { id: "chi-8", name: "Lonzo Ball", age: 26, position: "PG", contractValue: 21400000, aiScore: 45 },
      { id: "chi-9", name: "André Drummond", age: 30, position: "C", contractValue: 3300000, aiScore: 42 },
      { id: "chi-10", name: "Javonte Green", age: 30, position: "SF", contractValue: 2000000, aiScore: 35 },
      { id: "chi-11", name: "Torrey Craig", age: 33, position: "SF", contractValue: 2800000, aiScore: 38 },
      { id: "chi-12", name: "Dalen Terry", age: 22, position: "SG", contractValue: 3500000, aiScore: 55 },
      { id: "chi-13", name: "Julian Phillips", age: 21, position: "SF", contractValue: 2100000, aiScore: 60 },
      { id: "chi-14", name: "Jevon Carter", age: 29, position: "PG", contractValue: 2600000, aiScore: 40 },
      { id: "chi-15", name: "Onuralp Bitim", age: 24, position: "SF", contractValue: 1900000, aiScore: 48 },
    ],
    aiRecommendation: `**Recommended Protection List — Chicago Bulls**

1. **Ayo Dosunmu** (Score: 82) — Elite contract efficiency. Young combo guard on a team-friendly deal producing starter-level output. Must protect.
2. **Coby White** (Score: 78) — Breakout scoring guard with upside. At 24, he's entering his prime on a reasonable contract.
3. **Alex Caruso** (Score: 76) — Elite perimeter defender. His two-way impact far exceeds his salary.
4. **Patrick Williams** (Score: 74) — High-ceiling young forward. Still developing but the positional value and age profile are ideal.
5. **Zach LaVine** (Score: 72) — Despite the max contract, his scoring talent is irreplaceable. The expansion team would love this caliber of player.
6. **DeMar DeRozan** (Score: 65) — Veteran scorer with declining trade value but still a 20+ PPG contributor.
7. **Julian Phillips** (Score: 60) — Rookie-scale contract with developmental upside. Low cost to protect.
8. **Nikola Vučević** (Score: 58) — Borderline case, but his passing and scoring from the center position are hard to replace.

*Players left exposed: Ball (injury risk), Drummond, Green, Craig, Terry, Carter, Bitim — all replaceable role players or high-risk contracts.*`,
  },
  den: {
    id: "den",
    name: "Denver Nuggets",
    abbreviation: "DEN",
    conference: "Western",
    players: [
      { id: "den-1", name: "Nikola Jokić", age: 29, position: "C", contractValue: 51415938, aiScore: 99 },
      { id: "den-2", name: "Jamal Murray", age: 27, position: "PG", contractValue: 33833400, aiScore: 85 },
      { id: "den-3", name: "Michael Porter Jr.", age: 26, position: "SF", contractValue: 35850000, aiScore: 80 },
      { id: "den-4", name: "Aaron Gordon", age: 28, position: "PF", contractValue: 22826400, aiScore: 77 },
      { id: "den-5", name: "Kentavious Caldwell-Pope", age: 31, position: "SG", contractValue: 14700000, aiScore: 73 },
      { id: "den-6", name: "Christian Braun", age: 23, position: "SG", contractValue: 3700000, aiScore: 84 },
      { id: "den-7", name: "Peyton Watson", age: 21, position: "SF", contractValue: 3200000, aiScore: 70 },
      { id: "den-8", name: "Reggie Jackson", age: 34, position: "PG", contractValue: 5200000, aiScore: 38 },
      { id: "den-9", name: "Zeke Nnaji", age: 23, position: "PF", contractValue: 3800000, aiScore: 52 },
      { id: "den-10", name: "DeAndre Jordan", age: 35, position: "C", contractValue: 2100000, aiScore: 25 },
      { id: "den-11", name: "Vlatko Čančar", age: 27, position: "SF", contractValue: 3500000, aiScore: 30 },
      { id: "den-12", name: "Julian Strawther", age: 22, position: "SG", contractValue: 2000000, aiScore: 58 },
      { id: "den-13", name: "Jalen Pickett", age: 25, position: "PG", contractValue: 1900000, aiScore: 45 },
      { id: "den-14", name: "Hunter Tyson", age: 24, position: "PF", contractValue: 1800000, aiScore: 42 },
      { id: "den-15", name: "Braxton Key", age: 26, position: "SF", contractValue: 1700000, aiScore: 33 },
    ],
    aiRecommendation: `**Recommended Protection List — Denver Nuggets**

1. **Nikola Jokić** (Score: 99) — Three-time MVP. The most valuable player in the league. Non-negotiable.
2. **Jamal Murray** (Score: 85) — Championship-proven PG. His playoff performance alone justifies the max contract.
3. **Christian Braun** (Score: 84) — Incredible value on a rookie deal. Championship DNA and rapidly improving.
4. **Michael Porter Jr.** (Score: 80) — When healthy, an elite floor-spacing forward. The upside is too high to expose.
5. **Aaron Gordon** (Score: 77) — Perfect complementary star. His defense and versatility anchor the forward rotation.
6. **Kentavious Caldwell-Pope** (Score: 73) — Elite 3-and-D wing on a fair deal. Championship experience.
7. **Peyton Watson** (Score: 70) — Raw but explosive athletic upside on a cheap deal. Protect the potential.
8. **Julian Strawther** (Score: 58) — Borderline pick, but his shooting upside on a minimum deal edges out Nnaji.

*Players left exposed: Jackson (aging), Jordan (veteran minimum), Čančar (limited role), Nnaji, Pickett, Tyson, Key — depth pieces that can be replaced.*`,
  },
  nyk: {
    id: "nyk",
    name: "New York Knicks",
    abbreviation: "NYK",
    conference: "Eastern",
    players: [
      { id: "nyk-1", name: "Jalen Brunson", age: 27, position: "PG", contractValue: 36900000, aiScore: 94 },
      { id: "nyk-2", name: "Julius Randle", age: 29, position: "PF", contractValue: 28226088, aiScore: 75 },
      { id: "nyk-3", name: "RJ Barrett", age: 23, position: "SF", contractValue: 23340000, aiScore: 68 },
      { id: "nyk-4", name: "Mitchell Robinson", age: 26, position: "C", contractValue: 14340000, aiScore: 71 },
      { id: "nyk-5", name: "OG Anunoby", age: 26, position: "SF", contractValue: 18000000, aiScore: 83 },
      { id: "nyk-6", name: "Donte DiVincenzo", age: 27, position: "SG", contractValue: 15400000, aiScore: 79 },
      { id: "nyk-7", name: "Josh Hart", age: 29, position: "SG", contractValue: 12960000, aiScore: 77 },
      { id: "nyk-8", name: "Isaiah Hartenstein", age: 26, position: "C", contractValue: 8800000, aiScore: 81 },
      { id: "nyk-9", name: "Immanuel Quickley", age: 24, position: "PG", contractValue: 12900000, aiScore: 72 },
      { id: "nyk-10", name: "Quentin Grimes", age: 24, position: "SG", contractValue: 4500000, aiScore: 55 },
      { id: "nyk-11", name: "Miles McBride", age: 24, position: "PG", contractValue: 2100000, aiScore: 62 },
      { id: "nyk-12", name: "Jericho Sims", age: 25, position: "C", contractValue: 1900000, aiScore: 35 },
      { id: "nyk-13", name: "Evan Fournier", age: 31, position: "SG", contractValue: 18900000, aiScore: 28 },
      { id: "nyk-14", name: "Trevor Keels", age: 21, position: "SG", contractValue: 1800000, aiScore: 40 },
      { id: "nyk-15", name: "DaQuan Jeffries", age: 27, position: "SF", contractValue: 2000000, aiScore: 32 },
    ],
    aiRecommendation: `**Recommended Protection List — New York Knicks**

1. **Jalen Brunson** (Score: 94) — Franchise cornerstone. Elite PG production on a value contract. Untouchable.
2. **OG Anunoby** (Score: 83) — Premier 3-and-D forward. His two-way impact is among the best in the league.
3. **Isaiah Hartenstein** (Score: 81) — Massively undervalued center. Advanced stats love his passing and rim protection.
4. **Donte DiVincenzo** (Score: 79) — Sharpshooter who transformed the Knicks' spacing. Great value.
5. **Josh Hart** (Score: 77) — The ultimate glue guy. Rebounds, hustle, and clutch play from the wing.
6. **Julius Randle** (Score: 75) — All-Star production despite inconsistency. Too talented to leave exposed.
7. **Immanuel Quickley** (Score: 72) — Dynamic scoring guard off the bench. Sixth Man potential.
8. **Mitchell Robinson** (Score: 71) — Elite offensive rebounder and rim protector when healthy.

*Players left exposed: Fournier (negative value contract), Barrett (overpaid for current production), Grimes, Sims, McBride, Keels, Jeffries — tough to lose McBride but the math favors protecting higher-value assets.*`,
  },
};
