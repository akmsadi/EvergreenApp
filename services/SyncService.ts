import { MatchModel } from "@/database/models/MatchModel";
import { PlayerModel } from "@/database/models/PlayerModel";
import { VenueModel } from "@/database/models/VenueModel";
import MatchRepository from "@/database/repositories/MatchRepository";
import PlayerRepository from "@/database/repositories/PlayerRepository";
import VenueRepository from "@/database/repositories/VenueRepository";
import ApiService from "./ApiService";

class SyncService {

    /**
     * Sync all application data
     */
    async syncAll() {
        const result = {
            matches: await this.syncMatches(),
            // teams: await this.syncTeams(),
            // players: await this.syncPlayers(),
        };

        return result;
    }

    /**
     * Download matches from server and save to SQLite
     */
    async syncMatches(): Promise<number> {
        const matches = await ApiService.get<MatchModel[]>("/matches");

        MatchRepository.saveMany(
            matches.map(match => ({
                ...match,
                id: Number(match.id),
                format_overs: Number(match.format_overs),
                venue_id: match.venue_id ? Number(match.venue_id) : null,
                synced_at: new Date().toISOString(),
                from_admin: 1,
                dirty: 0,
            }))
        );
        return matches.length;
    }

    /**
     * Download matches from server and save to SQLite
     */
    async syncScheduledMatches(): Promise<number> {
        const matches = await ApiService.get<MatchModel[]>("/matches/scheduled");

        MatchRepository.saveMany(
            matches.map(match => ({
                ...match,
                id: Number(match.id),
                format_overs: Number(match.format_overs),
                venue_id: match.venue_id ? Number(match.venue_id) : null,
                synced_at: new Date().toISOString(),
                from_admin: 1,
                dirty: 0,
            }))
        );
        return matches.length;
    }

    /**
     * Placeholder
     */
    async syncTeams(): Promise<number> {
        return 0;
    }

    /**
     * Download players from server and save to SQLite
     */
    async syncPlayers(): Promise<number> {
        const players = await ApiService.get<PlayerModel[]>("/players");

        // Reset all server IDs first
        PlayerRepository.clearServerIds();

        // Re-map downloaded players
        PlayerRepository.saveMany(
            players.map(player => ({
                ...player,
                server_id: Number(player.server_id),
                guest_of_player_id: player.guest_of_player_id ?? null,
                total_contribution: Number(player.total_contribution),
                total_expense: Number(player.total_expense),
            }))
        );
        return players.length;
    }

    /**
     * Download venues from server and save to SQLite
     */
    async syncVenues(): Promise<number> {
        const venues = await ApiService.get<VenueModel[]>("/venues");
        VenueRepository.saveMany(
            venues.map(venue => ({
                ...venue,
                id: Number(venue.id),
            }))
        );
        return venues.length;
    }
}

export default new SyncService();