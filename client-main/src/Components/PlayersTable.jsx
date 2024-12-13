import React, { useState } from 'react';
import { Table, TableHead, TableRow, TableBody, TableCell } from "../Components/ui/table";
import { Button } from "../Components/ui/button";
import { Edit, ChevronDown, ChevronUp } from "lucide-react";

const PlayersTable = ({ players, onEdit }) => {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (playerId) => {
    setExpandedRows(prev => ({
      ...prev,
      [playerId]: !prev[playerId]
    }));
  };

  return (
    <div className="h-full overflow-y-auto">
      <Table className="table-fixed">
        <colgroup>
          <col className="w-[20%]" />
          <col className="w-[20%]" />
          <col className="w-[20%]" />
          <col className="w-[15%]" />
          <col className="w-[10%]" />
          <col className="w-[15%]" />
        </colgroup>
        <TableHead className="sticky top-0 bg-white z-10">
          <TableRow>
            <TableCell className="bg-gray-50 font-semibold">Name</TableCell>
            <TableCell className="bg-gray-50 font-semibold">Position</TableCell>
            <TableCell className="bg-gray-50 font-semibold">Country</TableCell>
            <TableCell className="bg-gray-50 font-semibold whitespace-nowrap">Date of Birth</TableCell>
            {/* <TableCell className="bg-gray-50 font-semibold text-center">Rating</TableCell> */}
            <TableCell className="bg-gray-50 font-semibold">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {players?.length > 0 ? (
            players.map((player) => (
              <React.Fragment key={player._id}>
                <TableRow className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium truncate">{player.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {player.position?.position || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>{player.country?.country || "N/A"}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {player.dateOfBirth
                      ? new Date(player.dateOfBirth).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  {/* <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                        ${player.rating >= 4.5 ? 'bg-green-100 text-green-800' :
                          player.rating >= 3.5 ? 'bg-yellow-100 text-yellow-800' :
                          player.rating >= 0 ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {player.rating || "No ratings"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-6 w-6"
                        onClick={() => toggleRow(player._id)}
                      >
                        {expandedRows[player._id] ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        }
                      </Button>
                    </div>
                  </TableCell> */}
                  <TableCell>
                    <Button
                      onClick={() => onEdit(player)}
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center justify-center gap-2 hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                  </TableCell>
                </TableRow>
                {/* {expandedRows[player._id] && (
                  <TableRow>
                    <TableCell colSpan={6} className="bg-gray-50">
                      <div className="px-4 py-2">
                        <h4 className="text-sm font-medium mb-2">Rating History</h4>
                        <div className="space-y-2">
                          {player.ratingHistory?.length > 0 ? (
                            player.ratingHistory.map((entry, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{new Date(entry.date).toLocaleDateString()}</span>
                                <span className="text-gray-600">Previous: {entry.previousRating?.toFixed(1) || 'N/A'}</span>
                                <span className={`font-medium ${entry.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {entry.change >= 0 ? '+' : ''}{entry.change?.toFixed(1)}
                                </span>
                                <span className="font-medium">{entry.newRating?.toFixed(1) || 'N/A'}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-500 text-sm">No rating history available</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )} */}
              </React.Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell 
                colSpan={6} 
                className="h-24 text-center text-gray-500"
              >
                No players found for this club
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PlayersTable;