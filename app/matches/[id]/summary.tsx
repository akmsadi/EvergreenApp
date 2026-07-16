import AppHeader from "@/components/AppHeader";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";

import { MatchModel } from "@/database/models/MatchModel";
import MatchRepository from "@/database/repositories/MatchRepository";
import PlayerRepository from "@/database/repositories/PlayerRepository";

import { format } from "@/features/scoring/helpers/OversHelper";
import { InningsModel } from "@/features/scoring/models/InningsModel";
import DeliveryRepository from "@/features/scoring/repositories/DeliveryRepository";
import InningsBattingRepository from "@/features/scoring/repositories/InningsBattingRepository";
import InningsBowlingRepository from "@/features/scoring/repositories/InningsBowlingRepository";
import InningsRepository from "@/features/scoring/repositories/InningsRepository";
import { DismissalType } from "@/features/scoring/types/DismissalType";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Print from "expo-print";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, DataTable, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BattingRow {
    playerId: string;
    position: number;
    name: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    strikeRate: string;
    dismissal: string;
    isNotOut: boolean;
}

interface BowlingRow {
    playerId: string;
    name: string;
    overs: string;
    maidens: number;
    runs: number;
    wickets: number;
    economy: string;
}

interface FallOfWicket {
    wicketNo: number;
    runs: number;
    playerName: string;
    overBall: string;
}

interface InningsView {
    inningsId: number;
    teamName: string;
    bowlingTeamName: string;
    totalRuns: number;
    wickets: number;
    legalBalls: number;
    oversDisplay: string;
    battingRows: BattingRow[];
    bowlingRows: BowlingRow[];
    fallOfWickets: FallOfWicket[];
    extrasTotal: number;
    extrasBreakdown: string;
}

function teamNameFor(match: MatchModel, team: "team_a" | "team_b"): string {
    return team === "team_a" ? match.team_name : match.opponent_name;
}

function escapeHtml(text: string): string {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function buildSummaryHtml(match: MatchModel, inningsViews: InningsView[], tossWinnerName: string | null, matchDate: string | null): string {
    const metaParts = [`Match #${match.id}`, match.match_type.toUpperCase(), `${match.format_overs} ov`, match.venue ?? null, matchDate].filter(
        (part): part is string => !!part,
    );

    const inningsHtml = inningsViews
        .map(
            (innings, index) => `
        <div class="innings-page"${index > 0 ? ' style="page-break-before: always; padding-top: 32px;"' : ""}>
        <table>
            <thead>
                <tr class="table-label">
                    <th colspan="8">
                        <div class="table-label-row">
                            <span>Batting: ${escapeHtml(innings.teamName)}</span>
                            <span>${innings.totalRuns}/${innings.wickets} (${innings.oversDisplay} ov)</span>
                        </div>
                    </th>
                </tr>
                <tr>
                    <th>#</th><th>Batter</th><th class="num">R</th><th class="num">B</th>
                    <th class="num">4s</th><th class="num">6s</th><th class="num">SR</th><th>Dismissal</th>
                </tr>
            </thead>
            <tbody>
                ${innings.battingRows
                    .map(
                        (row) => `
                <tr>
                    <td>${row.position}</td>
                    <td><strong>${escapeHtml(row.name)}${row.isNotOut ? " *" : ""}</strong></td>
                    <td class="num"><strong>${row.runs}</strong></td>
                    <td class="num">${row.balls}</td>
                    <td class="num">${row.fours}</td>
                    <td class="num">${row.sixes}</td>
                    <td class="num">${row.strikeRate}</td>
                    <td>${escapeHtml(row.dismissal)}</td>
                </tr>`,
                    )
                    .join("")}
                <tr class="extras-row"><td colspan="7">Extras (${escapeHtml(innings.extrasBreakdown)})</td><td class="num">${innings.extrasTotal}</td></tr>
                <tr class="total-row"><td colspan="7">TOTAL</td><td class="num">${innings.totalRuns}/${innings.wickets}</td></tr>
            </tbody>
        </table>
        ${
            innings.fallOfWickets.length > 0
                ? `<div class="fow">Fall of Wickets: ${innings.fallOfWickets
                      .map((fow) => `${fow.wicketNo}-${fow.runs} (${escapeHtml(fow.playerName)}, ${fow.overBall} ov)`)
                      .join(", ")}</div>`
                : ""
        }
        <table>
            <thead>
                <tr class="table-label"><th colspan="7">Bowling: ${escapeHtml(innings.bowlingTeamName)}</th></tr>
                <tr><th>#</th><th>Bowler</th><th class="num">O</th><th class="num">M</th><th class="num">R</th><th class="num">W</th><th class="num">Econ</th></tr>
            </thead>
            <tbody>
                ${innings.bowlingRows
                    .map(
                        (row, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${escapeHtml(row.name)}</td>
                    <td class="num">${row.overs}</td>
                    <td class="num">${row.maidens}</td>
                    <td class="num">${row.runs}</td>
                    <td class="num"><strong>${row.wickets}</strong></td>
                    <td class="num">${row.economy}</td>
                </tr>`,
                    )
                    .join("")}
            </tbody>
        </table>
        </div>`,
        )
        .join("");

    return `
    <html>
        <head>
            <meta charset="utf-8" />
            <style>
                body { font-family: Helvetica, Arial, sans-serif; color: #263238; padding: 24px; }
                h1 { font-size: 20px; margin: 0 0 4px; }
                .meta { color: #607D8B; font-size: 12px; margin-bottom: 12px; }
                .result { background: #FFF8E1; border: 1px solid #FBC02D; border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; font-weight: 700; }
                .toss { color: #607D8B; font-size: 12px; margin-bottom: 16px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                th { text-align: left; font-size: 10px; color: #607D8B; border-bottom: 1px solid #eee; padding: 6px 4px; }
                td { padding: 6px 4px; border-bottom: 1px solid #f0f0f0; }
                .num { text-align: center; width: 50px; }
                .extras-row td, .total-row td { font-weight: 700; }
                .total-row { background: #E8F5E9; }
                .fow { font-size: 11px; color: #607D8B; margin: 8px 0 16px; page-break-inside: avoid; break-inside: avoid; }
                .table-label th {
                    background: #E8F5E9; padding: 8px 12px; font-weight: 700; font-size: 13px; color: #263238;
                }
                .table-label-row { display: flex; justify-content: space-between; }
                tr { page-break-inside: avoid; break-inside: avoid; }
            </style>
        </head>
        <body>
            <h1>${escapeHtml(match.team_name)} vs ${escapeHtml(match.opponent_name)}</h1>
            <div class="meta">${metaParts.map(escapeHtml).join(" &middot; ")}</div>
            ${match.result_summary ? `<div class="result">Result: ${escapeHtml(match.result_summary)}</div>` : ""}
            ${
                tossWinnerName
                    ? `<div class="toss">Toss: ${escapeHtml(tossWinnerName)} won and elected to ${match.toss_decision === "bowl" ? "bowl" : "bat"} first</div>`
                    : ""
            }
            ${inningsHtml}
        </body>
    </html>`;
}

function dismissalText(isOut: boolean, dismissalType: string | undefined, bowlerName: string | undefined, fielderName: string | undefined): string {
    if (!isOut) {
        return "not out";
    }

    switch (dismissalType) {
        case DismissalType.BOWLED:
            return bowlerName ? `b ${bowlerName}` : "bowled";
        case DismissalType.CAUGHT:
            if (bowlerName && fielderName && bowlerName === fielderName) {
                return `c & b ${bowlerName}`;
            }
            if (fielderName && bowlerName) {
                return `c ${fielderName} b ${bowlerName}`;
            }
            return "caught";
        case DismissalType.LBW:
            return bowlerName ? `lbw b ${bowlerName}` : "lbw";
        case DismissalType.RUN_OUT:
            return fielderName ? `run out (${fielderName})` : "run out";
        case DismissalType.STUMPED:
            if (fielderName && bowlerName) {
                return `st ${fielderName} b ${bowlerName}`;
            }
            return "stumped";
        case DismissalType.HIT_WICKET:
            return bowlerName ? `hit wicket b ${bowlerName}` : "hit wicket";
        case DismissalType.RETIRED_HURT:
            return "retired hurt";
        case DismissalType.RETIRED_OUT:
            return "retired out";
        case DismissalType.OBSTRUCTING_THE_FIELD:
            return "obstructing the field";
        case DismissalType.HIT_BALL_TWICE:
            return "hit ball twice";
        case DismissalType.TIMED_OUT:
            return "timed out";
        default:
            return "out";
    }
}

function buildInningsView(innings: InningsModel, match: MatchModel): InningsView {
    const inningsId = innings.id as number;

    const battingRows: BattingRow[] = InningsBattingRepository.findAll(inningsId).map((row) => {
        const bowlerName = row.bowler_id ? PlayerRepository.find(row.bowler_id)?.name : undefined;
        const fielderName = row.fielder_id ? PlayerRepository.find(row.fielder_id)?.name : undefined;
        const balls = row.balls;
        const strikeRate = balls > 0 ? ((row.runs / balls) * 100).toFixed(1) : "0.0";

        return {
            playerId: row.player_id,
            position: row.batting_position,
            name: PlayerRepository.find(row.player_id)?.name ?? "Unknown",
            runs: row.runs,
            balls: row.balls,
            fours: row.fours,
            sixes: row.sixes,
            strikeRate,
            dismissal: dismissalText(row.is_out, row.dismissal_type, bowlerName, fielderName),
            isNotOut: !row.is_out,
        };
    });

    const bowlingRows: BowlingRow[] = InningsBowlingRepository.findAll(inningsId).map((row) => {
        const overs = row.balls / 6;
        const economy = overs > 0 ? (row.runs / overs).toFixed(2) : "0.00";

        return {
            playerId: row.player_id,
            name: PlayerRepository.find(row.player_id)?.name ?? "Unknown",
            overs: format(row.balls),
            maidens: row.maidens,
            runs: row.runs,
            wickets: row.wickets,
            economy,
        };
    });

    const deliveries = DeliveryRepository.findAll(inningsId);

    const extraTotals: Record<string, number> = { B: 0, LB: 0, WD: 0, NB: 0 };
    const fallOfWickets: FallOfWicket[] = [];
    let cumulativeRuns = 0;
    let wicketCount = 0;

    for (const delivery of deliveries) {
        cumulativeRuns += delivery.total_runs;

        if (delivery.extra_type && delivery.extra_type in extraTotals) {
            extraTotals[delivery.extra_type] += delivery.extra_runs;
        }

        if (delivery.is_wicket) {
            wicketCount += 1;

            const dismissedPlayerId = delivery.dismissed_player_id ?? delivery.batsman_id;

            fallOfWickets.push({
                wicketNo: wicketCount,
                runs: cumulativeRuns,
                playerName: PlayerRepository.find(dismissedPlayerId)?.name ?? "Unknown",
                overBall: `${delivery.over_no}.${delivery.ball_no}`,
            });
        }
    }

    return {
        inningsId,
        teamName: teamNameFor(match, innings.batting_team),
        bowlingTeamName: teamNameFor(match, innings.bowling_team),
        totalRuns: innings.total_runs,
        wickets: innings.wickets,
        legalBalls: innings.legal_balls,
        oversDisplay: format(innings.legal_balls),
        battingRows,
        bowlingRows,
        fallOfWickets,
        extrasTotal: innings.extras,
        extrasBreakdown: `B ${extraTotals.B}, LB ${extraTotals.LB}, W ${extraTotals.WD}, NB ${extraTotals.NB}`,
    };
}

export default function Summary() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [match, setMatch] = useState<MatchModel | null>(null);
    const [inningsViews, setInningsViews] = useState<InningsView[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const { id: matchId } = useLocalSearchParams<{ id: string }>();

    useEffect(() => {
        const foundMatch = MatchRepository.find(Number(matchId));

        if (!foundMatch) {
            return;
        }

        setMatch(foundMatch);

        const firstInnings = InningsRepository.findByMatchAndNo(foundMatch.id, 1);
        const secondInnings = InningsRepository.findByMatchAndNo(foundMatch.id, 2);

        const views = [firstInnings, secondInnings]
            .filter((innings): innings is InningsModel => !!innings)
            .map((innings) => buildInningsView(innings, foundMatch));

        setInningsViews(views);
        setActiveIndex(0);
    }, [matchId]);

    if (!match) {
        return (
            <View style={styles.container}>
                <AppHeader title='Match Result' showBack />
            </View>
        );
    }

    const activeInnings = inningsViews[activeIndex];

    const tossWinnerName = match.toss_winner ? teamNameFor(match, match.toss_winner as "team_a" | "team_b") : null;

    const matchDate = match.scheduled_at
        ? new Date(match.scheduled_at).toLocaleDateString(undefined, {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
          })
        : null;

    async function handleDownloadPdf(currentMatch: MatchModel) {
        if (isGeneratingPdf || inningsViews.length === 0) {
            return;
        }

        setIsGeneratingPdf(true);

        try {
            const html = buildSummaryHtml(currentMatch, inningsViews, tossWinnerName, matchDate);
            const { uri } = await Print.printToFileAsync({ html });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    mimeType: "application/pdf",
                    dialogTitle: `${currentMatch.team_name} vs ${currentMatch.opponent_name} Summary`,
                });
            }
        } catch {
            Alert.alert("Download failed", "Could not generate the match summary PDF. Please try again.");
        } finally {
            setIsGeneratingPdf(false);
        }
    }

    return (
        <View style={styles.container}>
            <AppHeader
                title='Match Result'
                showBack='/matches'
                rightIcon={isGeneratingPdf ? "progress-download" : "download"}
                onRightPress={() => handleDownloadPdf(match)}
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerPanel}>
                    <View style={styles.headerTopRow}>
                        <Text style={styles.matchNumber}>MATCH #{match.id}</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusBadgeText}>{match.match_status.toUpperCase()}</Text>
                        </View>
                    </View>

                    <Text style={styles.matchTitle}>
                        {match.team_name} <Text style={styles.vsText}>vs</Text> {match.opponent_name}
                    </Text>

                    <Text style={styles.matchMetaLine}>
                        {match.match_type.toUpperCase()} · {match.format_overs} ov
                        {match.venue ? ` · ${match.venue}` : ""}
                        {matchDate ? ` · ${matchDate}` : ""}
                    </Text>

                    {inningsViews.length > 0 && (
                        <View style={styles.scoreCardsRow}>
                            {inningsViews.map((innings) => (
                                <View style={styles.scoreCard} key={innings.inningsId}>
                                    <Text style={styles.scoreCardTeam} numberOfLines={1}>
                                        {innings.teamName.toUpperCase()}
                                    </Text>
                                    <Text style={styles.scoreCardScore}>
                                        {innings.totalRuns}/{innings.wickets}
                                    </Text>
                                    <Text style={styles.scoreCardOvers}>{innings.oversDisplay} overs</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {!!match.result_summary && (
                        <View style={styles.resultBanner}>
                            <MaterialCommunityIcons name='trophy' size={22} color={Colors.warning} />

                            <View style={styles.resultTextWrapper}>
                                <Text style={styles.resultLabel}>RESULT</Text>
                                <Text style={styles.resultText}>{match.result_summary}</Text>
                            </View>
                        </View>
                    )}

                    {!!tossWinnerName && (
                        <Text style={styles.tossText}>
                            Toss: {tossWinnerName} won and elected to {match.toss_decision === "bowl" ? "bowl" : "bat"} first
                        </Text>
                    )}
                </View>

                {inningsViews.length > 1 && (
                    <View style={styles.tabsRow}>
                        {inningsViews.map((innings, index) => (
                            <Text key={innings.inningsId} style={[styles.tab, index === activeIndex && styles.tabActive]} onPress={() => setActiveIndex(index)}>
                                <Text style={[styles.tabTeam, index === activeIndex && styles.tabTeamActive]}>{innings.teamName}</Text>
                                {"  "}
                                <Text style={styles.tabScore}>
                                    {innings.totalRuns}/{innings.wickets}
                                </Text>
                            </Text>
                        ))}
                    </View>
                )}

                {activeInnings && (
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitle}>🏏 {activeInnings.teamName} Innings</Text>
                            <Text style={styles.sectionTotal}>
                                {activeInnings.totalRuns}/{activeInnings.wickets} ({activeInnings.oversDisplay} ov)
                            </Text>
                        </View>

                        <DataTable>
                            <DataTable.Header style={styles.tableHeaderRow}>
                                <DataTable.Title style={styles.colIndex}>
                                    <Text style={styles.th}>#</Text>
                                </DataTable.Title>
                                <DataTable.Title style={styles.colBatter}>
                                    <Text style={styles.th}>BATTER</Text>
                                </DataTable.Title>
                                <DataTable.Title style={styles.colNum}>
                                    <Text style={styles.th}>R</Text>
                                </DataTable.Title>
                                <DataTable.Title style={styles.colNum}>
                                    <Text style={styles.th}>B</Text>
                                </DataTable.Title>
                                <DataTable.Title style={styles.colNum}>
                                    <Text style={styles.th}>4</Text>
                                </DataTable.Title>
                                <DataTable.Title style={styles.colNum}>
                                    <Text style={styles.th}>6</Text>
                                </DataTable.Title>
                                <DataTable.Title style={styles.colDismissal}>
                                    <Text style={styles.th}>DISMISSAL</Text>
                                </DataTable.Title>
                            </DataTable.Header>

                            {activeInnings.battingRows.map((row) => (
                                <DataTable.Row key={row.playerId} style={styles.tableRow}>
                                    <DataTable.Cell style={styles.colIndex}>
                                        <Text style={[styles.td, styles.colIndexText]}>{row.position}</Text>
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.colBatter}>
                                        <Text style={[styles.td, styles.bold]} numberOfLines={1}>
                                            {row.name}
                                            {row.isNotOut ? " *" : ""}
                                        </Text>
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.colNum}>
                                        <Text style={[styles.td, styles.bold]}>{row.runs}</Text>
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.colNum}>
                                        <Text style={styles.td}>{row.balls}</Text>
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.colNum}>
                                        <Text style={styles.td}>{row.fours}</Text>
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.colNum}>
                                        <Text style={styles.td}>{row.sixes}</Text>
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.colDismissal}>
                                        <Text style={[styles.td, styles.colDismissalText, row.isNotOut && styles.notOutText]} numberOfLines={2}>
                                            {row.dismissal}
                                        </Text>
                                    </DataTable.Cell>
                                </DataTable.Row>
                            ))}
                        </DataTable>

                        <View style={styles.extrasRow}>
                            <Text style={styles.extrasLabel}>Extras</Text>
                            <Text style={styles.extrasBreakdown}>({activeInnings.extrasBreakdown})</Text>
                            <Text style={styles.extrasValue}>{activeInnings.extrasTotal}</Text>
                        </View>

                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>TOTAL</Text>
                            <Text style={styles.totalValue}>
                                {activeInnings.totalRuns}/{activeInnings.wickets} ({activeInnings.oversDisplay} ov)
                            </Text>
                        </View>

                        {activeInnings.fallOfWickets.length > 0 && (
                            <View style={styles.fowSection}>
                                <Text style={styles.fowLabel}>Fall of Wickets</Text>

                                <View style={styles.fowChipsRow}>
                                    {activeInnings.fallOfWickets.map((fow) => (
                                        <View style={styles.fowChip} key={fow.wicketNo}>
                                            <Text style={styles.fowChipText}>
                                                {fow.wicketNo}-{fow.runs} ({fow.playerName}, {fow.overBall} ov)
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitle}>⚡ Bowling — {activeInnings.bowlingTeamName}</Text>
                        </View>

                        <DataTable>
                            <DataTable.Header style={styles.tableHeaderRow}>
                                <DataTable.Title style={styles.colIndex}>
                                    <Text style={styles.th}>#</Text>
                                </DataTable.Title>
                                <DataTable.Title style={styles.colBatter}>
                                    <Text style={styles.th}>BOWLER</Text>
                                </DataTable.Title>
                                <DataTable.Title style={styles.colNum}>
                                    <Text style={styles.th}>O</Text>
                                </DataTable.Title>
                                <DataTable.Title style={styles.colNum}>
                                    <Text style={styles.th}>M</Text>
                                </DataTable.Title>
                                <DataTable.Title style={styles.colNum}>
                                    <Text style={styles.th}>R</Text>
                                </DataTable.Title>
                                <DataTable.Title style={styles.colNum}>
                                    <Text style={styles.th}>W</Text>
                                </DataTable.Title>
                                <DataTable.Title style={styles.colEconomy}>
                                    <Text style={styles.th}>ECON</Text>
                                </DataTable.Title>
                            </DataTable.Header>

                            {activeInnings.bowlingRows.map((row, index) => (
                                <DataTable.Row key={row.playerId} style={styles.tableRow}>
                                    <DataTable.Cell style={styles.colIndex}>
                                        <Text style={[styles.td, styles.colIndexText]}>{index + 1}</Text>
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.colBatter}>
                                        <Text style={styles.td} numberOfLines={1}>
                                            {row.name}
                                        </Text>
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.colNum}>
                                        <Text style={styles.td}>{row.overs}</Text>
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.colNum}>
                                        <Text style={styles.td}>{row.maidens}</Text>
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.colNum}>
                                        <Text style={styles.td}>{row.runs}</Text>
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.colNum}>
                                        <Text style={[styles.td, styles.bold]}>{row.wickets}</Text>
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.colEconomy}>
                                        <Text style={styles.td}>{row.economy}</Text>
                                    </DataTable.Cell>
                                </DataTable.Row>
                            ))}
                        </DataTable>
                    </View>
                )}
            </ScrollView>
            <View style={[styles.bottomButtons, { paddingBottom: Math.max(insets.bottom, Spacing.defaultSpace) }]}>
                <Button mode='contained' onPress={() => router.replace("/")} style={{ flex: 1 }} icon='arrow-left'>
                    Back to Dashboard
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    scrollContent: {
        paddingBottom: 24,
    },

    headerPanel: {
        backgroundColor: Colors.primary,
        padding: Spacing.defaultSpace,
        gap: 8,
    },

    headerTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    matchNumber: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: "700",
        opacity: 0.85,
    },

    statusBadge: {
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },

    statusBadgeText: {
        color: Colors.white,
        fontSize: 11,
        fontWeight: "700",
    },

    matchTitle: {
        color: Colors.white,
        fontSize: 22,
        fontWeight: "700",
    },

    vsText: {
        color: Colors.white,
        opacity: 0.6,
        fontWeight: "400",
    },

    matchMetaLine: {
        color: Colors.white,
        opacity: 0.8,
        fontSize: 13,
    },

    scoreCardsRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 8,
    },

    scoreCard: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: 12,
    },

    scoreCardTeam: {
        color: Colors.white,
        opacity: 0.8,
        fontSize: 11,
        fontWeight: "700",
    },

    scoreCardScore: {
        color: Colors.white,
        fontSize: 24,
        fontWeight: "700",
        marginTop: 2,
    },

    scoreCardOvers: {
        color: Colors.white,
        opacity: 0.7,
        fontSize: 12,
    },

    resultBanner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "rgba(251,192,45,0.15)",
        borderWidth: 1,
        borderColor: "rgba(251,192,45,0.5)",
        borderRadius: 8,
        padding: 12,
        marginTop: 4,
    },

    resultTextWrapper: {
        flex: 1,
    },

    resultLabel: {
        color: Colors.warning,
        fontSize: 11,
        fontWeight: "700",
        opacity: 0.9,
    },

    resultText: {
        color: Colors.white,
        fontSize: 15,
        fontWeight: "700",
        marginTop: 2,
    },

    tossText: {
        color: Colors.white,
        opacity: 0.75,
        fontSize: 12,
    },

    tabsRow: {
        flexDirection: "row",
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray,
    },

    tab: {
        flex: 1,
        textAlign: "center",
        padding: Spacing.defaultSpace,
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
    },

    tabActive: {
        borderBottomColor: Colors.primary,
    },

    tabTeam: {
        color: Colors.textSecondary,
        fontWeight: "700",
        fontSize: 13,
    },

    tabTeamActive: {
        color: Colors.primary,
    },

    tabScore: {
        color: Colors.textSecondary,
        fontSize: 12,
    },

    sectionCard: {
        backgroundColor: Colors.white,
        paddingVertical: 12,
    },

    sectionHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: Colors.border,
        padding: Spacing.defaultSpace,
    },

    sectionTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: Colors.text,
    },

    sectionTotal: {
        fontSize: 13,
        fontWeight: "700",
        color: Colors.primary,
    },

    tableHeaderRow: {
        flexDirection: "row",
        paddingHorizontal: Spacing.defaultSpace,
        backgroundColor: Colors.lightGray,
    },

    tableRow: {
        flexDirection: "row",
        paddingHorizontal: Spacing.defaultSpace,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray,
        alignItems: "center",
    },

    th: {
        fontSize: 10,
        fontWeight: "700",
        color: Colors.textSecondary,
    },

    td: {
        fontSize: 13,
        color: Colors.text,
    },

    colIndex: {
        width: 20,
        flex: 0,
    },

    colIndexText: {
        color: Colors.textSecondary,
    },

    colBatter: {
        flex: 2.4,
        paddingRight: 6,
    },

    colNum: {
        width: 32,
        flex: 0,
        justifyContent: "center",
    },

    colEconomy: {
        width: 48,
        flex: 0,
        justifyContent: "center",
    },

    colDismissal: {
        flex: 2,
    },

    colDismissalText: {
        fontSize: 11,
        color: Colors.textSecondary,
    },

    bold: {
        fontWeight: "700",
    },

    notOutText: {
        color: Colors.success,
        fontWeight: "700",
    },

    extrasRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: Spacing.defaultSpace,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray,
    },

    extrasLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
    },

    extrasBreakdown: {
        fontSize: 12,
        color: Colors.textSecondary,
        flex: 1,
        marginHorizontal: 8,
    },

    extrasValue: {
        fontSize: 13,
        fontWeight: "700",
        color: Colors.text,
    },

    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: Spacing.defaultSpace,
        paddingVertical: 10,
        backgroundColor: Colors.border,
    },

    totalLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: Colors.text,
    },

    totalValue: {
        fontSize: 15,
        fontWeight: "700",
        color: Colors.primary,
    },

    fowSection: {
        paddingHorizontal: Spacing.defaultSpace,
        paddingVertical: 10,
    },

    fowLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: Colors.textSecondary,
        marginBottom: 6,
    },

    fowChipsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },

    fowChip: {
        backgroundColor: Colors.lightGray,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },

    fowChipText: {
        fontSize: 11,
        color: Colors.text,
    },

    bottomButtons: {
        flexDirection: "row",
        gap: 12,
        marginTop: "auto",
        padding: Spacing.defaultSpace,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.darkGray,
    },
});
