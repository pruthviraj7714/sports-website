import { useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useToast } from "../hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getActiveClubs } from "../api/Clubs";
import { getCountries } from "../api/Country";
import { Card, CardContent, CardTitle } from "./ui/card";
import { Label } from "@radix-ui/react-label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Input } from "./ui/input";
import { PlayerList, TeamSelector } from "./AddMatch";

const PredictMatchPage = () => {
  const { toast } = useToast();
  const [matchType, setMatchType] = useState("ClubTeam");
  const [homePlayers, setHomePlayers] = useState([]);
  const [awayPlayers, setAwayPlayers] = useState([]);
  const [selectedHomeCountry, setSelectedHomeCountry] = useState(null);
  const [selectedAwayCountry, setSelectedAwayCountry] = useState(null);
  const [homeNationalTeams, setHomeNationalTeams] = useState([]);
  const [awayNationalTeams, setAwayNationalTeams] = useState([]);
  const [homeTeamRating, setHomeTeamRating] = useState(0);
  const [awayTeamRating, setAwayTeamRating] = useState(0);
  const [playerCounts, setPlayerCounts] = useState({
    home: 0,
    away: 0,
  });
  const [isPredicted, setIsPredicted] = useState(false);
  const [matchData, setMatchData] = useState({
    type: "ClubTeam",
    date: "",
    venue: "",
    rating: {
      homeTeamRating: 0,
      awayTeamRating: 0,
    },
    homeTeam: {
      team: "",
      score: "",
      players: [],
    },
    awayTeam: {
      team: "",
      score: "",
      players: [],
    },
  });

  const { data: clubsData } = useQuery({
    queryKey: ["clubs"],
    queryFn: getActiveClubs,
    enabled: matchType === "ClubTeam",
  });

  const { data: countriesData } = useQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
    enabled: matchType === "NationalTeam",
    select: (data) =>
      data.map((country) =>
        typeof country === "string" ? country : country.country
      ),
  });

  const handleTeamChange = (selected, isHome) => {
    const teamKey = isHome ? "homeTeam" : "awayTeam";
    setMatchData((prev) => ({
      ...prev,
      [teamKey]: {
        team: selected?.value || "",
        score: "",
        players: [],
      },
    }));

    setPlayerCounts((prev) => ({
      ...prev,
      [isHome ? "home" : "away"]: 0,
    }));
  };

  const calculateTotalTeamRating = (players) => {
    const totalRating = players.reduce((teamAcc, p) => {
      const playerTotal = p.player.ratingHistory.reduce(
        (acc, r) => acc + r.newRating,
        0
      );
      return teamAcc + playerTotal;
    }, 0);
    return totalRating.toFixed(2);
  };

  const handleMatchTypeChange = (value) => {
    setMatchType(value);
    setMatchData((prev) => ({
      ...prev,
      type: value,
      homeTeam: { team: "", score: "", players: [] },
      awayTeam: { team: "", score: "", players: [] },
    }));
    setSelectedHomeCountry(null);
    setSelectedAwayCountry(null);
    setHomeNationalTeams([]);
    setAwayNationalTeams([]);
    setHomePlayers([]);
    setAwayPlayers([]);
    setPlayerCounts({ home: 0, away: 0 });
  };

  const handlePlayerSelection = useCallback((player, isStarter, isHome) => {
    const teamKey = isHome ? "homeTeam" : "awayTeam";
    setMatchData((prev) => {
      const currentPlayers = [...prev[teamKey].players];
      const playerIndex = currentPlayers.findIndex(
        (p) => p.player._id === player._id
      );

      let updatedPlayers;
      if (playerIndex === -1 && isStarter) {
        updatedPlayers = [
          ...currentPlayers,
          { player: player, starter: true, _id: player._id },
        ];
      } else if (!isStarter) {
        updatedPlayers = currentPlayers.filter(
          (p) => p.player._id !== player._id
        );
      } else {
        updatedPlayers = currentPlayers.map((p) =>
          p.player._id === player._id
            ? { ...p, starter: true, _id: player._id }
            : p
        );
      }

      return {
        ...prev,
        [teamKey]: {
          ...prev[teamKey],
          players: updatedPlayers,
        },
      };
    });
  }, []);

  // Update player counts
  useEffect(() => {
    const homeStarterCount = matchData.homeTeam.players.filter(
      (p) => p.starter
    ).length;
    const awayStarterCount = matchData.awayTeam.players.filter(
      (p) => p.starter
    ).length;

    setPlayerCounts({
      home: homeStarterCount,
      away: awayStarterCount,
    });
  }, [matchData.homeTeam.players, matchData.awayTeam.players]);

  // Fetch players effect
  useEffect(() => {
    const fetchPlayers = async (teamId, isHome) => {
      if (!teamId || !matchData.date) return;

      try {
        let players;
        const dateParam = encodeURIComponent(matchData.date);

        if (matchType === "ClubTeam") {
          const response = await fetch(
            `${
              import.meta.env.VITE_REACT_APP_API_URL
            }/api/club/${teamId}/players?date=${dateParam}`
          );
          if (!response.ok) throw new Error("Failed to fetch players");
          players = await response.json();
        } else {
          const response = await fetch(
            `${
              import.meta.env.VITE_REACT_APP_API_URL
            }/api/country/national-teams/${teamId}/players?date=${dateParam}`
          );
          if (!response.ok) throw new Error("Failed to fetch players");
          players = await response.json();
        }

        if (isHome) {
          setHomePlayers(players);
        } else {
          setAwayPlayers(players);
        }
      } catch (error) {
        console.error("Error fetching players:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to fetch ${
            isHome ? "home" : "away"
          } team players`,
        });
      }
    };

    if (matchData.date) {
      if (matchData.homeTeam.team) fetchPlayers(matchData.homeTeam.team, true);
      if (matchData.awayTeam.team) fetchPlayers(matchData.awayTeam.team, false);
    }
  }, [
    matchData.homeTeam.team,
    matchData.awayTeam.team,
    matchData.date,
    matchType,
    toast,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPredicted(true);
    console.log(matchData);
  };

  return (
    <div className="p-8 w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Predict Match</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Match Type</Label>
                <RadioGroup
                  value={matchType}
                  onValueChange={handleMatchTypeChange}
                  className="flex space-x-4"
                >
                  <RadioGroupItem value="ClubTeam" id="club">
                    Club Match
                  </RadioGroupItem>
                  <RadioGroupItem value="NationalTeam" id="national">
                    National Team Match
                  </RadioGroupItem>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Date</label>
                  <Input
                    type="datetime-local"
                    value={
                      matchData.date
                        ? new Date(matchData.date).toISOString().slice(0, 16)
                        : ""
                    }
                    onChange={(e) => {
                      const selectedDate = new Date(
                        e.target.value
                      ).toISOString();
                      setMatchData((prev) => ({
                        ...prev,
                        date: selectedDate,
                      }));
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Venue</label>
                  <Input
                    type="text"
                    value={matchData.venue}
                    onChange={(e) =>
                      setMatchData((prev) => ({
                        ...prev,
                        venue: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Home Team */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Home Team</h3>
              <div className="space-y-4">
                <TeamSelector
                  isHome={true}
                  matchType={matchType}
                  selectedTeam={
                    matchData.homeTeam.team
                      ? {
                          value: matchData.homeTeam.team,
                          label:
                            matchType === "ClubTeam"
                              ? clubsData?.find(
                                  (club) => club._id === matchData.homeTeam.team
                                )?.name
                              : homeNationalTeams?.find(
                                  (team) => team._id === matchData.homeTeam.team
                                )
                              ? `${selectedHomeCountry?.label} ${
                                  homeNationalTeams.find(
                                    (team) =>
                                      team._id === matchData.homeTeam.team
                                  ).type
                                }`
                              : "",
                        }
                      : null
                  }
                  onTeamChange={(selected) => handleTeamChange(selected, true)}
                  clubsData={clubsData}
                  countriesData={countriesData}
                  selectedCountry={selectedHomeCountry}
                  setSelectedCountry={setSelectedHomeCountry}
                  nationalTeams={homeNationalTeams}
                  setNationalTeams={setHomeNationalTeams}
                />

                <PlayerList
                  players={homePlayers}
                  isHome={true}
                  handlePlayerSelection={handlePlayerSelection}
                  selectedPlayers={matchData.homeTeam.players}
                  playerCount={playerCounts.home}
                />
              </div>
            </CardContent>
          </Card>

          {/* Away Team */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Away Team</h3>
              <div className="space-y-4">
                <TeamSelector
                  isHome={false}
                  matchType={matchType}
                  selectedTeam={
                    matchData.awayTeam.team
                      ? {
                          value: matchData.awayTeam.team,
                          label:
                            matchType === "ClubTeam"
                              ? clubsData?.find(
                                  (club) => club._id === matchData.awayTeam.team
                                )?.name
                              : awayNationalTeams?.find(
                                  (team) => team._id === matchData.awayTeam.team
                                )
                              ? `${selectedAwayCountry?.label} ${
                                  awayNationalTeams.find(
                                    (team) =>
                                      team._id === matchData.awayTeam.team
                                  ).type
                                }`
                              : "",
                        }
                      : null
                  }
                  onTeamChange={(selected) => handleTeamChange(selected, false)}
                  clubsData={clubsData}
                  countriesData={countriesData}
                  selectedCountry={selectedAwayCountry}
                  setSelectedCountry={setSelectedAwayCountry}
                  nationalTeams={awayNationalTeams}
                  setNationalTeams={setAwayNationalTeams}
                />

                <PlayerList
                  players={awayPlayers}
                  isHome={false}
                  handlePlayerSelection={handlePlayerSelection}
                  selectedPlayers={matchData.awayTeam.players}
                  playerCount={playerCounts.away}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="submit">Predict Match</Button>
        </div>
      </form>
      {isPredicted && (
        <Card className="p-5">
          <CardTitle className="mt-2 mb-6">Predictions</CardTitle>
          <CardContent>
            <div className="flex items-center gap-3 my-2">
              <Label>Home Team Players Rating:</Label>
              <Input
                value={
                  calculateTotalTeamRating(matchData.homeTeam.players) ?? 0
                }
                disabled
                className="font-bold text-black"
              />
            </div>
            <div className="flex items-center gap-3 my-2">
              <Label>Away Team Players Rating:</Label>
              <Input
                value={
                  calculateTotalTeamRating(matchData.awayTeam.players) ?? 0
                }
                disabled
                className="font-bold text-black"
              />
            </div>
            <div className="flex items-center gap-3 my-2">
              <Label>Home Team Rating:</Label>
              <Input value={0} disabled className="font-bold text-black" />
            </div>
            <div className="flex items-center gap-3 my-2">
              <Label>Away Team Rating:</Label>
              <Input value={0} disabled className="font-bold text-black" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PredictMatchPage;
