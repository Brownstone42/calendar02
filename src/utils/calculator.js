import { BaziCalculator } from '@aharris02/bazi-calculator-by-alvamind'
import { toDate } from 'date-fns-tz'
import * as XLSX from 'xlsx'

const ELEMENT_KEYS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water']
const ROOT_BONUS = { primary: 0.3, secondary: 0.2, tertiary: 0.1 }

const DIRECTION_MAP = {
    North: 'Water',
    Northeast: 'Earth',
    East: 'Wood',
    Southeast: 'Wood',
    South: 'Fire',
    Southwest: 'Earth',
    West: 'Metal',
    Northwest: 'Metal',
}

const DIRECTION_MAP2 = {
    Wood: 'East, Southeast',
    Fire: 'South',
    Earth: 'Northeast, Southwest',
    Metal: 'West, Northwest',
    Water: 'North',
}

const COLOR_MAP = {
    Wood: 'Green',
    Fire: 'Red',
    Earth: 'Brown',
    Metal: 'Gray, White',
    Water: 'Black, Blue',
}

const ZODIAC_CLASH_MAP = {
    Rat: 'Horse',
    Ox: 'Goat',
    Tiger: 'Monkey',
    Rabbit: 'Rooster',
    Dragon: 'Dog',
    Snake: 'Pig',
    Horse: 'Rat',
    Goat: 'Ox',
    Monkey: 'Tiger',
    Rooster: 'Rabbit',
    Dog: 'Dragon',
    Pig: 'Snake',
}

const SEASON_MAP = {
    Tiger: {
        name: 'Early Spring',
        score: {
            Wood: 1.3,
            Fire: 1.0,
            Earth: 1.0,
            Metal: 0.7,
            Water: 1.0,
        },
    },
    Rabbit: {
        name: 'Spring',
        score: {
            Wood: 1.3,
            Fire: 1.0,
            Earth: 1.0,
            Metal: 0.7,
            Water: 1.0,
        },
    },
    Dragon: {
        name: 'Late Spring',
        score: {
            Wood: 1.3,
            Fire: 1.0,
            Earth: 1.3,
            Metal: 0.7,
            Water: 0.7,
        },
    },
    Snake: {
        name: 'Early Summer',
        score: {
            Wood: 0.7,
            Fire: 1.3,
            Earth: 1.0,
            Metal: 0.7,
            Water: 0.7,
        },
    },
    Horse: {
        name: 'Summer',
        score: {
            Wood: 0.7,
            Fire: 1.3,
            Earth: 1.0,
            Metal: 0.7,
            Water: 0.7,
        },
    },
    Goat: {
        name: 'Late Summer',
        score: {
            Wood: 0.7,
            Fire: 1.3,
            Earth: 1.3,
            Metal: 0.7,
            Water: 0.7,
        },
    },
    Monkey: {
        name: 'Early Autumn',
        score: {
            Wood: 0.7,
            Fire: 1.0,
            Earth: 1.0,
            Metal: 1.3,
            Water: 1.0,
        },
    },
    Rooster: {
        name: 'Autumn',
        score: {
            Wood: 0.7,
            Fire: 1.0,
            Earth: 1.0,
            Metal: 1.3,
            Water: 1.0,
        },
    },
    Dog: {
        name: 'Late Autumn',
        score: {
            Wood: 0.7,
            Fire: 1.0,
            Earth: 1.3,
            Metal: 1.3,
            Water: 0.7,
        },
    },
    Pig: {
        name: 'Early Winter',
        score: {
            Wood: 1.0,
            Fire: 0.7,
            Earth: 1.0,
            Metal: 1.0,
            Water: 1.3,
        },
    },
    Rat: {
        name: 'Winter',
        score: {
            Wood: 1.0,
            Fire: 0.7,
            Earth: 1.0,
            Metal: 1.0,
            Water: 1.3,
        },
    },
    Ox: {
        name: 'Late Winter',
        score: {
            Wood: 0.7,
            Fire: 0.7,
            Earth: 1.3,
            Metal: 1.0,
            Water: 1.3,
        },
    },
}

function isClash(sign1, sign2) {
    return ZODIAC_CLASH_MAP[sign1] === sign2
}

function isClashUnfavorite(sign1, sign2, element, favorite) {
    if (ZODIAC_CLASH_MAP[sign1] === sign2) {
        if (!favorite.includes(element)) {
            return true
        }
    }
    return false
}

function zeroTotals() {
    return ELEMENT_KEYS.reduce((acc, k) => ((acc[k] = 0), acc), {})
}

function stemToElement(stem) {
    const raw = stem?.elementType || STEM_CHAR_TO_ELEMENT[stem?.character]
    return normalizeElement(raw)
}

function normalizeElement(el) {
    if (!el) return null
    const up = String(el).trim().toUpperCase()
    if (up === 'WOOD') return 'Wood'
    if (up === 'FIRE') return 'Fire'
    if (up === 'EARTH') return 'Earth'
    if (up === 'METAL') return 'Metal'
    if (up === 'WATER') return 'Water'
    return null
}

function hiddenWeights(len) {
    if (len === 1) return [1.0]
    if (len === 2) return [0.7, 0.3]
    if (len >= 3) return [0.7, 0.2, 0.1].slice(0, len)
    return []
}

function getSeason(pillars) {
    const animal = pillars.monthBranch.animal
    return SEASON_MAP[animal]
}

function rankFromIndex(idx) {
    if (idx === 0) return 'primary'
    if (idx === 1) return 'secondary'
    if (idx === 2) return 'tertiary'
    return null
}

function matchRootRank(stem, branch) {
    if (!stem || !branch) return null
    const stemChar = stem.character
    const hs = branch.hiddenStems || []
    const idx = hs.findIndex((h) => h?.character === stemChar)
    return rankFromIndex(idx)
}

function getRelationship(dayMaster, element) {
    switch (dayMaster) {
        case 'Wood':
            if (element === 'Fire') return 'Output'
            if (element === 'Earth') return 'Wealth'
            if (element === 'Metal') return 'Control'
            if (element === 'Water') return 'Support'
            if (element === 'Wood') return 'Self'
            break
        case 'Fire':
            if (element === 'Earth') return 'Output'
            if (element === 'Metal') return 'Wealth'
            if (element === 'Water') return 'Control'
            if (element === 'Wood') return 'Support'
            if (element === 'Fire') return 'Self'
            break
        case 'Earth':
            if (element === 'Metal') return 'Output'
            if (element === 'Water') return 'Wealth'
            if (element === 'Wood') return 'Control'
            if (element === 'Fire') return 'Support'
            if (element === 'Earth') return 'Self'
            break
        case 'Metal':
            if (element === 'Water') return 'Output'
            if (element === 'Wood') return 'Wealth'
            if (element === 'Fire') return 'Control'
            if (element === 'Earth') return 'Support'
            if (element === 'Metal') return 'Self'
            break
        case 'Water':
            if (element === 'Wood') return 'Output'
            if (element === 'Fire') return 'Wealth'
            if (element === 'Earth') return 'Control'
            if (element === 'Metal') return 'Support'
            if (element === 'Water') return 'Self'
            break
    }
}

function getPillars(birthday, isTimeKnown, gender) {
    const dateTime = isTimeKnown ? birthday : birthday + 'T12:00:00'
    const birthDate = toDate(dateTime, { timeZone: 'Asia/Bangkok' })

    const calculator = new BaziCalculator(birthDate, gender, 'Asia/Bangkok', true)
    const completeAnalysis = calculator.getCompleteAnalysis()
    const detailedPillars = completeAnalysis.detailedPillars

    const pillars = {
        dayStem: detailedPillars.day.heavenlyStem,
        monthStem: detailedPillars.month.heavenlyStem,
        yearStem: detailedPillars.year.heavenlyStem,
        dayBranch: detailedPillars.day.earthlyBranch,
        monthBranch: detailedPillars.month.earthlyBranch,
        yearBranch: detailedPillars.year.earthlyBranch,
        luckPillars: completeAnalysis.luckPillars.pillars,
        full: completeAnalysis,
    }

    return pillars
}

function getScore(pillars) {
    const totals = zeroTotals()

    const add = (el, amt) => {
        if (!el || !Number.isFinite(amt)) return
        totals[el] += amt
    }

    const stems = [pillars?.yearStem, pillars?.monthStem, pillars?.dayStem]
    for (const s of stems) {
        const el = stemToElement(s)
        add(el, 1.0)
    }

    const branches = [pillars?.yearBranch, pillars?.monthBranch, pillars?.dayBranch]
    for (const b of branches) {
        const hs = b?.hiddenStems || []
        const w = hiddenWeights(hs.length)
        hs.forEach((h, idx) => {
            const el = stemToElement(h)
            add(el, w[idx] ?? 0)
        })
    }

    //console.log(totals)

    const totals2 = zeroTotals()
    const multipliers = getSeason(pillars).score

    for (const el of ELEMENT_KEYS) {
        const mul = Number(multipliers[el])
        totals2[el] = totals[el] * mul
    }

    //console.log(totals2)
    const totals3 = totals2

    const pairs = [
        { pos: 'year', stem: pillars?.yearStem, branch: pillars?.yearBranch },
        { pos: 'month', stem: pillars?.monthStem, branch: pillars?.monthBranch },
        { pos: 'day', stem: pillars?.dayStem, branch: pillars?.dayBranch },
    ]

    for (const p of pairs) {
        const rank = matchRootRank(p.stem, p.branch)
        if (!rank) continue
        const element = stemToElement(p.stem)
        const bonus = ROOT_BONUS[rank] ?? 0
        if (element && Number.isFinite(bonus)) {
            totals3[element] += bonus
        }
    }

    //console.log(totals3)

    const final = zeroTotals()
    const sum = ELEMENT_KEYS.reduce((acc, el) => acc + (Number(totals3[el]) || 0), 0)

    for (const el of ELEMENT_KEYS) {
        final[el] = Number(((totals3[el] / sum) * 100).toFixed(2))
    }

    return final
}

function getCurrentScoreYM(pillars) {
    const totals = zeroTotals()

    const add = (el, amt) => {
        if (!el || !Number.isFinite(amt)) return
        totals[el] += amt
    }

    const stems = [pillars?.yearStem, pillars?.monthStem]
    for (const s of stems) {
        const el = stemToElement(s)
        add(el, 1.0)
    }

    const branches = [pillars?.yearBranch, pillars?.monthBranch]
    for (const b of branches) {
        const hs = b?.hiddenStems || []
        const w = hiddenWeights(hs.length)
        hs.forEach((h, idx) => {
            const el = stemToElement(h)
            add(el, w[idx] ?? 0)
        })
    }

    const final = zeroTotals()
    const sum = ELEMENT_KEYS.reduce((acc, el) => acc + (Number(totals[el]) || 0), 0)

    for (const el of ELEMENT_KEYS) {
        final[el] = Number(((totals[el] / sum) * 100).toFixed(2))
    }

    return final
}

function getCountScoreYM(pillars) {
    const totals = zeroTotals()
    const add = (el, amt) => {
        if (!el || !Number.isFinite(amt)) return
        totals[el] += amt
    }

    const stems = [pillars?.yearStem, pillars?.monthStem]
    for (const s of stems) {
        const el = stemToElement(s)
        add(el, 1.0)
    }

    const branches = [pillars?.yearBranch, pillars?.monthBranch]
    for (const b of branches) {
        const el = stemToElement(b)
        add(el, 1.0)
    }

    return totals
}

function getDayMaster(pillars) {
    const dayMaster = normalizeElement(pillars.dayStem.elementType)
    return dayMaster
}

function getDayMasterStrength(dayMaster, score) {
    let dayMasterScore = 0
    let dayMasterStr = ''

    for (const key in score) {
        const relationship = getRelationship(dayMaster, key)
        if (relationship == 'Self' || relationship == 'Support') {
            dayMasterScore += Number(score[key])
        } else if (relationship == 'Output' || relationship == 'Wealth') {
            dayMasterScore -= Number(score[key] / 2)
        } else {
            dayMasterScore -= Number(score[key])
        }
    }

    if (dayMasterScore > 10) {
        dayMasterStr = 'Strong'
    } else if (dayMasterScore < -10) {
        dayMasterStr = 'Weak'
    } else {
        dayMasterStr = 'Balance'
    }

    return dayMasterStr
}

function getDayMasterStrengthScore(dayMaster, score) {
    let dayMasterScore = 0
    let dayMasterStr = ''

    for (const key in score) {
        const relationship = getRelationship(dayMaster, key)
        if (relationship == 'Self' || relationship == 'Support') {
            dayMasterScore += Number(score[key])
        } else if (relationship == 'Output' || relationship == 'Wealth') {
            dayMasterScore -= Number(score[key] / 2)
        } else {
            dayMasterScore -= Number(score[key])
        }
    }

    return dayMasterScore
}

function getFavoriteElement(dayMaster, score, dayMasterStrength) {
    const favorite = []
    const newScore = {}
    let filtered = []
    for (const [element, value] of Object.entries(score)) {
        const relation = getRelationship(dayMaster, element)
        newScore[relation] = {
            score: parseFloat(value),
            element: element,
        }
    }

    if (dayMasterStrength == 'Strong') {
        filtered = ['Wealth', 'Control', 'Output'].map((key) => ({
            relation: key,
            ...newScore[key],
        }))
    } else {
        filtered = ['Self', 'Support'].map((key) => ({
            relation: key,
            ...newScore[key],
        }))
    }

    filtered.sort((a, b) => a.score - b.score)
    filtered.forEach((item) => {
        favorite.push(item.element)
    })

    return favorite
}

function tranformScore(dayMaster, score) {
    const relationshipScore = {
        self1: 0,
        self2: 0,
        output1: 0,
        output2: 0,
        wealth1: 0,
        wealth2: 0,
        control1: 0,
        control2: 0,
        support1: 0,
        support2: 0,
    }

    for (const element in score) {
        const relationship = getRelationship(dayMaster, element)

        if (relationship == 'Self') {
            switch (true) {
                case score[element] >= 70:
                    relationshipScore.self1 = 7
                    relationshipScore.self2 = 7
                    break
                case score[element] >= 60:
                    relationshipScore.self1 = 7
                    relationshipScore.self2 = 6
                    break
                case score[element] >= 55:
                    relationshipScore.self1 = 6
                    relationshipScore.self2 = 5
                    break
                case score[element] >= 50:
                    relationshipScore.self1 = 6
                    relationshipScore.self2 = 4
                    break
                case score[element] >= 40:
                    relationshipScore.self1 = 6
                    relationshipScore.self2 = 4
                    break
                case score[element] >= 30:
                    relationshipScore.self1 = 5
                    relationshipScore.self2 = 3
                    break
                case score[element] >= 20:
                    relationshipScore.self1 = 5
                    relationshipScore.self2 = 2
                    break
                case score[element] >= 10:
                    relationshipScore.self1 = 3
                    relationshipScore.self2 = 1
                    break
                case score[element] > 0:
                    relationshipScore.self1 = 2
                    relationshipScore.self2 = 0
                    break
                case score[element] == 0:
                    relationshipScore.self1 = 0
                    relationshipScore.self2 = 0
                    break
            }
        } else if (relationship == 'Support') {
            switch (true) {
                case score[element] >= 80:
                    relationshipScore.support1 = 7
                    relationshipScore.support2 = 7
                    break
                case score[element] >= 70:
                    relationshipScore.support1 = 6
                    relationshipScore.support2 = 6
                    break
                case score[element] >= 60:
                    relationshipScore.support1 = 6
                    relationshipScore.support2 = 5
                    break
                case score[element] >= 50:
                    relationshipScore.support1 = 6
                    relationshipScore.support2 = 5
                    break
                case score[element] >= 40:
                    relationshipScore.support1 = 5
                    relationshipScore.support2 = 4
                    break
                case score[element] >= 30:
                    relationshipScore.support1 = 5
                    relationshipScore.support2 = 3
                    break
                case score[element] >= 20:
                    relationshipScore.support1 = 4
                    relationshipScore.support2 = 1
                    break
                case score[element] >= 10:
                    relationshipScore.support1 = 3
                    relationshipScore.support2 = 0
                    break
                case score[element] > 0:
                    relationshipScore.support1 = 2
                    relationshipScore.support2 = 0
                    break
                case score[element] == 0:
                    relationshipScore.support1 = 0
                    relationshipScore.support2 = 0
                    break
            }
        } else if (relationship == 'Output') {
            switch (true) {
                case score[element] >= 80:
                    relationshipScore.output1 = 5
                    relationshipScore.output2 = 1
                    break
                case score[element] >= 70:
                    relationshipScore.output1 = 5
                    relationshipScore.output2 = 1
                    break
                case score[element] >= 60:
                    relationshipScore.output1 = 5
                    relationshipScore.output2 = 2
                    break
                case score[element] >= 50:
                    relationshipScore.output1 = 6
                    relationshipScore.output2 = 2
                    break
                case score[element] >= 40:
                    relationshipScore.output1 = 6
                    relationshipScore.output2 = 3
                    break
                case score[element] >= 30:
                    relationshipScore.output1 = 7
                    relationshipScore.output2 = 4
                    break
                case score[element] >= 20:
                    relationshipScore.output1 = 5
                    relationshipScore.output2 = 6
                    break
                case score[element] >= 10:
                    relationshipScore.output1 = 3
                    relationshipScore.output2 = 4
                    break
                case score[element] > 0:
                    relationshipScore.output1 = 2
                    relationshipScore.output2 = 3
                    break
                case score[element] == 0:
                    relationshipScore.output1 = 0
                    relationshipScore.output2 = 1
                    break
            }
        } else if (relationship == 'Wealth') {
            switch (true) {
                case score[element] >= 80:
                    relationshipScore.wealth1 = 7
                    relationshipScore.wealth2 = 1
                    break
                case score[element] >= 70:
                    relationshipScore.wealth1 = 7
                    relationshipScore.wealth2 = 1
                    break
                case score[element] >= 60:
                    relationshipScore.wealth1 = 7
                    relationshipScore.wealth2 = 2
                    break
                case score[element] >= 50:
                    relationshipScore.wealth1 = 6
                    relationshipScore.wealth2 = 3
                    break
                case score[element] >= 40:
                    relationshipScore.wealth1 = 6
                    relationshipScore.wealth2 = 4
                    break
                case score[element] >= 30:
                    relationshipScore.wealth1 = 5
                    relationshipScore.wealth2 = 5
                    break
                case score[element] >= 20:
                    relationshipScore.wealth1 = 4
                    relationshipScore.wealth2 = 6
                    break
                case score[element] >= 10:
                    relationshipScore.wealth1 = 4
                    relationshipScore.wealth2 = 4
                    break
                case score[element] > 0:
                    relationshipScore.wealth1 = 3
                    relationshipScore.wealth2 = 3
                    break
                case score[element] == 0:
                    relationshipScore.wealth1 = 2
                    relationshipScore.wealth2 = 2
                    break
            }
        } else if (relationship == 'Control') {
            switch (true) {
                case score[element] >= 80:
                    relationshipScore.control1 = 7
                    relationshipScore.control2 = 4
                    break
                case score[element] >= 70:
                    relationshipScore.control1 = 7
                    relationshipScore.control2 = 5
                    break
                case score[element] >= 60:
                    relationshipScore.control1 = 6
                    relationshipScore.control2 = 5
                    break
                case score[element] >= 50:
                    relationshipScore.control1 = 5
                    relationshipScore.control2 = 4
                    break
                case score[element] >= 40:
                    relationshipScore.control1 = 4
                    relationshipScore.control2 = 3
                    break
                case score[element] >= 30:
                    relationshipScore.control1 = 4
                    relationshipScore.control2 = 4
                    break
                case score[element] >= 20:
                    relationshipScore.control1 = 3
                    relationshipScore.control2 = 4
                    break
                case score[element] >= 10:
                    relationshipScore.control1 = 2
                    relationshipScore.control2 = 3
                    break
                case score[element] > 0:
                    relationshipScore.control1 = 1
                    relationshipScore.control2 = 2
                    break
                case score[element] == 0:
                    relationshipScore.control1 = 0
                    relationshipScore.control2 = 1
                    break
            }
        }
    }

    return relationshipScore
}

function addTranformScore(dayMaster, score) {
    const relationshipScore = {
        self1: 0,
        self2: 0,
        output1: 0,
        output2: 0,
        wealth1: 0,
        wealth2: 0,
        control1: 0,
        control2: 0,
        support1: 0,
        support2: 0,
    }

    for (const element in score) {
        const relationship = getRelationship(dayMaster, element)

        if (relationship == 'Self') {
            relationshipScore.self1 = score[element]
            relationshipScore.self2 = score[element]
        } else if (relationship == 'Support') {
            relationshipScore.support1 = score[element]
            relationshipScore.support2 = score[element]
        } else if (relationship == 'Output') {
            relationshipScore.output1 = score[element]
            relationshipScore.output2 = score[element]
        } else if (relationship == 'Wealth') {
            relationshipScore.wealth1 = score[element]
            relationshipScore.wealth2 = score[element]
        } else if (relationship == 'Control') {
            relationshipScore.control1 = score[element]
            relationshipScore.control2 = score[element]
        }
    }

    return relationshipScore
}

function getLuckPillars(luckPillars) {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    let startIndex = -1

    for (let i = 0; i < luckPillars.length; i++) {
        const pillar = luckPillars[i]
        const isYearMatch = currentYear >= pillar.yearStart && currentYear <= pillar.yearEnd

        if (isYearMatch) {
            startIndex = i
            break
        }
    }

    if (startIndex !== -1) {
        const endIndex = Math.min(startIndex + 3, luckPillars.length)
        return luckPillars.slice(startIndex, endIndex)
    }

    return []
}

function findDanger(score, dayMaster, favorite, pillars, yearPrev, yearLp0, yearLp1) {
    const startYear = yearPrev

    const yz = pillars.yearBranch.animal
    const mz = pillars.monthBranch.animal
    const dz = pillars.dayBranch.animal

    const danger = {
        prev: [],
        lp0: [],
        lp1: [],
    }

    for (let year = startYear; year <= yearLp1 + 9; year++) {
        for (let month = 1; month <= 12; month++) {
            const current = year + '-' + String(month).padStart(2, '0')
            const currentFull = current + '-15'
            const currentPillars = getPillars(currentFull, false, 'male')
            const currentScore = getCurrentScoreYM(currentPillars)
            const combinedScore = Object.fromEntries(
                Object.keys(score).map((k) => [
                    k,
                    Number((((+score[k] + +currentScore[k] / 2) * 2) / 3).toFixed(2)),
                ]),
            )

            const cyz = currentPillars.yearBranch.animal
            const cmz = currentPillars.monthBranch.animal
            const cye = currentPillars.yearBranch.hiddenStems[0].name.split(' ')[1]
            const cme = currentPillars.monthBranch.hiddenStems[0].name.split(' ')[1]

            let isDanger = false
            let dangerType = ''
            let dangerObj = {}

            const clash = {
                yy: isClashUnfavorite(yz, cyz, cye, favorite),
                my: isClashUnfavorite(mz, cyz, cye, favorite),
                dy: isClashUnfavorite(dz, cyz, cye, favorite),
                ym: isClashUnfavorite(yz, cmz, cme, favorite),
                mm: isClashUnfavorite(mz, cmz, cme, favorite),
                dm: isClashUnfavorite(dz, cmz, cme, favorite),
            }
            const count = Object.values(clash).filter((v) => v === true).length
            clash.count = count

            for (const element of ['Wood', 'Fire', 'Earth', 'Metal', 'Water']) {
                if (!favorite.includes(element)) {
                    if (currentScore[element] >= 70) {
                        isDanger = true
                        dangerType = 'element'
                    }
                }
            }

            if (clash.count >= 1) {
                if (dangerType == 'element') {
                    isDanger = true
                    dangerType = 'both'
                } else if (clash.count >= 2) {
                    isDanger = true
                    dangerType = 'zodiac'
                }
            }

            if (isDanger) {
                dangerObj.month = current
                dangerObj.currentScore = currentScore
                dangerObj.score = combinedScore
                dangerObj.clash = clash
                dangerObj.type = dangerType

                if (year < yearLp0) {
                    danger.prev.push(dangerObj)
                } else if (year < yearLp1) {
                    danger.lp0.push(dangerObj)
                } else {
                    danger.lp1.push(dangerObj)
                }
            }
        }
    }

    //console.log(danger)
    return danger
}

function getRelationScore(score, dayMaster) {
    const result = {}
    let maxRel = ''
    let maxVal = 0

    for (const [element, raw] of Object.entries(score)) {
        const rel = getRelationship(dayMaster, element)
        const val = Number(raw)

        if (rel) result[rel] = { score: val, element }
        if (val > maxVal) {
            maxVal = val
            maxRel = rel
        }
    }

    result.max = maxRel
    return result
}

function getDirectionSuggest(score, favorite, direction) {
    const element = DIRECTION_MAP[direction]
    const percent = score[element]
    let result = null

    if (favorite.includes(element)) {
        if (percent == 0) {
            result = 'excellent'
        } else if (percent <= 5) {
            result = 'very good'
        } else if (percent <= 10) {
            result = 'good'
        } else if (percent <= 15) {
            result = 'pretty good'
        } else if (percent <= 20) {
            result = 'barely good'
        } else {
            result = 'normal'
        }
    } else {
        if (percent > 50) {
            result = 'terrible'
        } else if (percent > 45) {
            result = 'very bad'
        } else if (percent > 40) {
            result = 'bad'
        } else if (percent > 35) {
            result = 'pretty bad'
        } else if (percent > 30) {
            result = 'barely bad'
        } else {
            result = 'normal'
        }
    }

    return result
}

function findClash(yz, mz, dz, y) {
    const startYear = Number(y) - 12
    const endYear = Number(y) + 12
    const results = { clash: [], danger: [] }

    for (let year = startYear; year <= endYear; year++) {
        for (let month = 1; month <= 12; month++) {
            const current = year + '-' + String(month).padStart(2, '0')
            const currentFull = current + '-15'
            const currentPillars = getPillars(currentFull, false, 'male')
            const currentScore = getCurrentScoreYM(currentPillars)
            const cyz = currentPillars.yearBranch.animal
            const cmz = currentPillars.monthBranch.animal

            const clash = {
                yy: isClash(yz, cyz),
                ym: isClash(yz, cmz),
                my: isClash(mz, cyz),
                mm: isClash(mz, cmz),
                dy: isClash(dz, cyz),
                dm: isClash(dz, cmz),
            }
            const count = Object.values(clash).filter((v) => v === true).length
            clash.count = count

            if (count > 0) {
                const clashObj = {
                    year: year,
                    month: month,
                    clash,
                }

                results.clash.push(clashObj)
            }
            if (count >= 2) {
                if (Object.values(currentScore).some((v) => v >= 60)) {
                    const dangerObj = {
                        year: year,
                        month: month,
                        clash,
                        score: currentScore,
                    }

                    results.danger.push(dangerObj)
                }
            }
        }
    }

    return results
}

function findClash2(yz, mz, dz, y, score, favorite) {
    const startYear = Number(y) - 12
    const endYear = Number(y) + 12
    const results = { clash: [], danger: [] }

    for (let year = startYear; year <= endYear; year++) {
        for (let month = 1; month <= 12; month++) {
            const current = year + '-' + String(month).padStart(2, '0')
            const currentFull = current + '-15'
            const currentPillars = getPillars(currentFull, false, 'male')
            const currentScore = getCurrentScoreYM(currentPillars)
            const combinedScore = averageScores(score, currentScore)

            const cyz = currentPillars.yearBranch.animal
            const cmz = currentPillars.monthBranch.animal

            const cys = currentPillars.yearStem.name.split(' ')[1]
            const cms = currentPillars.monthStem.name.split(' ')[1]
            const cyb = currentPillars.yearBranch.hiddenStems[0].name.split(' ')[1]
            const cmb = currentPillars.monthBranch.hiddenStems[0].name.split(' ')[1]

            const clash = {
                yy: isClash(yz, cyz),
                ym: isClash(yz, cmz),
                my: isClash(mz, cyz),
                mm: isClash(mz, cmz),
                dy: isClash(dz, cyz),
                dm: isClash(dz, cmz),
            }
            const count = Object.values(clash).filter((v) => v === true).length
            clash.count = count

            if (count > 0) {
                const clashObj = {
                    year: year,
                    month: month,
                    clash,
                }

                results.clash.push(clashObj)
            }

            //CASE 1-6
            const danger = {
                combinedScore: combinedScore,
                currentScore: currentScore,
                selfScore: score,

                combinedMax: Math.max(...Object.values(combinedScore)),
                selfMax: Math.max(...Object.values(score)),

                unfavorite: {
                    fix: '-',
                    avoid: '-',
                    isFound: !favorite.includes(cys) && !favorite.includes(cms),
                    clash,
                },

                /*case1: {
                    name: 'Year Clash Year + Year Clash Month',
                    fix: '-',
                    avoid: '-',
                    isFound: isClash(yz, cyz) && isClash(yz, cmz),
                },
                case2: {
                    name: 'Day Clash Year + Day Clash Month',
                    fix: '-',
                    avoid: '-',
                    isFound: isClash(dz, cyz) && isClash(dz, cmz),
                },
                case3: {
                    name: 'Unfavorite Year + Unfavorite Month',
                    fix: '-',
                    avoid: '-',
                    clashYY: isClash(yz, cyz) && !favorite.includes(cys) && !favorite.includes(cms),
                    clashMY: isClash(mz, cyz) && !favorite.includes(cys) && !favorite.includes(cms),
                    clashDY: isClash(dz, cyz) && !favorite.includes(cys) && !favorite.includes(cms),
                    isFound: !favorite.includes(cys) && !favorite.includes(cms),
                },*/
            }

            if (danger.unfavorite.isFound) {
                danger.unfavorite.fix = getFix(favorite, combinedScore)
                danger.unfavorite.avoid = getAvoid(favorite, combinedScore)
            }

            const dangerCount = Object.values(danger).filter((v) => v.isFound === true).length
            danger.count = dangerCount

            if (dangerCount > 0) {
                const dangerObj = {
                    year: year,
                    month: month,
                    danger,
                    cys,
                    cms,
                    cyb,
                    cmb,
                }

                results.danger.push(dangerObj)
            }
            /*if (count >= 2) {
                if (Object.values(currentScore).some((v) => v >= 60)) {
                    const dangerObj = {
                        year: year,
                        month: month,
                        clash,
                        score: currentScore,
                    }

                    results.danger.push(dangerObj)
                }
            }*/
        }
    }

    return results
}

function averageScores(a, b) {
    const result = {}
    for (const key in a) {
        result[key] = (a[key] + b[key]) / 2
    }
    return result
}

function getFix(favorite, score, personal) {
    /*const filtered = Object.entries(score).filter(([el]) => favorite.includes(el))

    const [minElement] = filtered.reduce(
        (min, curr) => (curr[1] < min[1] ? curr : min),
        filtered[0],
    )*/

    const minElement = personal.min.element

    const direction = DIRECTION_MAP2[minElement]
    const color = COLOR_MAP[minElement]
    console.log(personal)

    let level = ''

    if (personal.min.score == 0) {
        level = '5'
    } else if (personal.min.score <= 5) {
        level = '4'
    } else if (personal.min.score <= 10) {
        level = '3'
    } else if (personal.min.score <= 15) {
        level = '2'
    } else if (personal.min.score <= 20) {
        level = '1'
    }

    const fix = {
        element: minElement,
        direction,
        color,
        level,
        text: '-',
    }

    return fix
}

function getAvoid(favorite, score, personal) {
    /*const filtered = Object.entries(score).filter(([el]) => !favorite.includes(el))

    const [maxElement] = filtered.reduce(
        (max, curr) => (curr[1] > max[1] ? curr : max),
        filtered[0],
    )*/

    const maxElement = personal.max.element

    const direction = DIRECTION_MAP2[maxElement]
    const color = COLOR_MAP[maxElement]
    console.log(personal)

    const avoid = {
        element: maxElement,
        direction,
        color,
        text: '-',
    }

    return avoid
}

function tranformScore2(dayMaster, score) {
    const relationshipScore = {
        self1: { score: 0, text: 'ความมั่นใจในตัวเอง', balance: '' },
        self2: { score: 0, text: 'การรับฟังคนรอบข้าง', balance: '' },
        output1: { score: 0, text: '', balance: '' },
        output2: { score: 0, text: '', balance: '' },
        wealth1: { score: 0, text: '', balance: '' },
        wealth2: { score: 0, text: '', balance: '' },
        control1: { score: 0, text: '', balance: '' },
        control2: { score: 0, text: '', balance: '' },
        support1: { score: 0, text: 'การสนับสนุนจากคนอื่น', balance: '' },
        support2: { score: 0, text: 'การช่วยเหลือตัวเอง', balance: '' },
    }

    for (const element in score) {
        const relationship = getRelationship(dayMaster, element)

        if (relationship == 'Self') {
            switch (true) {
                case score[element] >= 70:
                    relationshipScore.self1.score = 100
                    relationshipScore.self1.balance = 'สูงมากที่สุด'
                    relationshipScore.self2.score = 100
                    relationshipScore.self2.balance = 'ไม่ฟังใครเลย'
                    break
                case score[element] >= 60:
                    relationshipScore.self1.score = 100
                    relationshipScore.self1.balance = 'สูงมากที่สุด'
                    relationshipScore.self2.score = 80
                    relationshipScore.self2.balance = 'แทบจะไม่ฟังใครเลย'
                    break
                case score[element] >= 50:
                    relationshipScore.self1.score = 90
                    relationshipScore.self1.balance = 'สูงมากๆ'
                    relationshipScore.self2.score = 80
                    relationshipScore.self2.balance = 'แทบจะไม่ฟังใครเลย'
                    break
                case score[element] >= 45:
                    relationshipScore.self1.score = 80
                    relationshipScore.self1.balance = 'สูงมาก'
                    relationshipScore.self2.score = 70
                    relationshipScore.self2.balance = 'ฟังบ้างเล็กน้อย แต่ยังเชื่อตัวเองเป็นหลัก'
                    break
                case score[element] >= 40:
                    relationshipScore.self1.score = 70
                    relationshipScore.self1.balance = 'สูงมากพอสมควร'
                    relationshipScore.self2.score = 70
                    relationshipScore.self2.balance = 'ฟังบ้างเล็กน้อย แต่ยังเชื่อตัวเองเป็นหลัก'
                    break
                case score[element] >= 35:
                    relationshipScore.self1.score = 70
                    relationshipScore.self1.balance = 'สูงมากพอสมควร'
                    relationshipScore.self2.score = 60
                    relationshipScore.self2.balance =
                        'รับฟังคนรอบข้าง แต่ส่วนใหญ่ยังเชื่อตัวเองมากกว่าเล็กน้อย'
                    break
                case score[element] >= 30:
                    relationshipScore.self1.score = 60
                    relationshipScore.self1.balance = 'ค่อนข้างสูง'
                    relationshipScore.self2.score = 60
                    relationshipScore.self2.balance =
                        'รับฟังคนรอบข้าง แต่ส่วนใหญ่ยังเชื่อตัวเองมากกว่าเล็กน้อย'
                    break
                case score[element] >= 25:
                    relationshipScore.self1.score = 55
                    relationshipScore.self1.balance = 'ค่อนข้างสูงเล็กน้อย'
                    relationshipScore.self2.score = 50
                    relationshipScore.self2.balance = 'รับฟังคนรอบข้าง และตัดสินใจตามหลักเหตุและผล'
                    break
                case score[element] >= 20:
                    relationshipScore.self1.score = 50
                    relationshipScore.self1.balance = 'สูงกำลังดี'
                    relationshipScore.self2.score = 50
                    relationshipScore.self2.balance = 'รับฟังคนรอบข้าง และตัดสินใจตามหลักเหตุและผล'
                    break
                case score[element] >= 15:
                    relationshipScore.self1.score = 40
                    relationshipScore.self1.balance = 'น้อยกว่าปกติเล็กน้อย'
                    relationshipScore.self2.score = 50
                    relationshipScore.self2.balance = 'รับฟังคนรอบข้าง และตัดสินใจตามหลักเหตุและผล'
                    break
                case score[element] >= 10:
                    relationshipScore.self1.score = 30
                    relationshipScore.self1.balance = 'น้อยกว่าปกติพอสมควร'
                    relationshipScore.self2.score = 40
                    relationshipScore.self2.balance =
                        'รับฟังคนรอบข้างและมักจะเชื่อคนรอบข้างมากกว่าเชื่อตัวเองเป็นบางครั้ง'
                    break
                case score[element] >= 5:
                    relationshipScore.self1.score = 20
                    relationshipScore.self1.balance = 'น้อยมาก'
                    relationshipScore.self2.score = 30
                    relationshipScore.self2.balance =
                        'รับฟังคนรอบข้างและมักจะเชื่อคนรอบข้างมากกว่าเชื่อตัวเองเป็นส่วนใหญ่'
                    break
                case score[element] > 0:
                    relationshipScore.self1.score = 10
                    relationshipScore.self1.balance = 'แทบไม่มีเลย'
                    relationshipScore.self2.score = 20
                    relationshipScore.self2.balance =
                        'เลือกที่จะเชื่อคนอื่นมากกว่าตัวเองแทบจะทุกครั้ง'
                    break
                case score[element] == 0:
                    relationshipScore.self1.score = 0
                    relationshipScore.self1.balance = 'ไม่มีความมั่นใจในตัวเองเลย'
                    relationshipScore.self2.score = 10
                    relationshipScore.self2.balance =
                        'ไม่กล้าตัดสินใจอะไรทำให้ต้องคอยฟังคำของคนอื่นเสมอ'
                    break
            }
        } else if (relationship == 'Support') {
            switch (true) {
                case score[element] >= 70:
                    relationshipScore.support1.score = 100
                    relationshipScore.support1.balance = 'ได้รับการสนับสนุนจากคนอื่นตลอดเวลา'
                    relationshipScore.support2.score = 0
                    relationshipScore.support2.balance = 'พึ่งคนอื่นมากเกินไปจนทำอะไรเองไม่เป็น'
                    break
                case score[element] >= 60:
                    relationshipScore.support1.score = 100
                    relationshipScore.support1.balance = 'ได้รับการสนับสนุนจากคนอื่นตลอดเวลา'
                    relationshipScore.support2.score = 10
                    relationshipScore.support2.balance =
                        'พึ่งคนอื่นมากเกินไปจนแทบจะทำอะไรเองไม่ค่อยเป็น'
                    break
                case score[element] >= 50:
                    relationshipScore.support1.score = 90
                    relationshipScore.support1.balance = 'ได้รับการสนับสนุนจากคนอื่นแทบจะตลอดเวลา'
                    relationshipScore.support2.score = 20
                    relationshipScore.support2.balance =
                        'พึ่งคนอื่นมากเกินไปจนบางครั้งทำอะไรเองไม่ค่อยเป็น'
                    break
                case score[element] >= 45:
                    relationshipScore.support1.score = 80
                    relationshipScore.support1.balance = ''
                    relationshipScore.support2.score = 30
                    relationshipScore.support2.balance = ''
                    break
                case score[element] >= 40:
                    relationshipScore.support1.score = 70
                    relationshipScore.support1.balance = ''
                    relationshipScore.support2.score = 30
                    relationshipScore.support2.balance = ''
                    break
                case score[element] >= 35:
                    relationshipScore.support1.score = 70
                    relationshipScore.support1.balance = ''
                    relationshipScore.support2.score = 40
                    relationshipScore.support2.balance = ''
                    break
                case score[element] >= 30:
                    relationshipScore.support1.score = 60
                    relationshipScore.support1.balance = ''
                    relationshipScore.support2.score = 40
                    relationshipScore.support2.balance = ''
                    break
                case score[element] >= 25:
                    relationshipScore.support1.score = 55
                    relationshipScore.support1.balance = ''
                    relationshipScore.support2.score = 50
                    relationshipScore.support2.balance = ''
                    break
                case score[element] >= 20:
                    relationshipScore.support1.score = 50
                    relationshipScore.support1.balance = ''
                    relationshipScore.support2.score = 50
                    relationshipScore.support2.balance = ''
                    break
                case score[element] >= 15:
                    relationshipScore.support1.score = 40
                    relationshipScore.support1.balance = ''
                    relationshipScore.support2.score = 50
                    relationshipScore.support2.balance = ''
                    break
                case score[element] >= 10:
                    relationshipScore.support1.score = 30
                    relationshipScore.support1.balance = ''
                    relationshipScore.support2.score = 60
                    relationshipScore.support2.balance = ''
                    break
                case score[element] >= 5:
                    relationshipScore.support1.score = 20
                    relationshipScore.support1.balance = ''
                    relationshipScore.support2.score = 70
                    relationshipScore.support2.balance = ''
                    break
                case score[element] > 0:
                    relationshipScore.support1.score = 10
                    relationshipScore.support1.balance = ''
                    relationshipScore.support2.score = 80
                    relationshipScore.support2.balance = ''
                    break
                case score[element] == 0:
                    relationshipScore.support1.score = 0
                    relationshipScore.support1.balance = ''
                    relationshipScore.support2.score = 90
                    relationshipScore.support2.balance = ''
                    break
            }
        } else if (relationship == 'Output') {
            switch (true) {
                case score[element] >= 80:
                    relationshipScore.output1 = 5
                    relationshipScore.output2 = 1
                    break
                case score[element] >= 70:
                    relationshipScore.output1 = 5
                    relationshipScore.output2 = 1
                    break
                case score[element] >= 60:
                    relationshipScore.output1 = 5
                    relationshipScore.output2 = 2
                    break
                case score[element] >= 50:
                    relationshipScore.output1 = 6
                    relationshipScore.output2 = 2
                    break
                case score[element] >= 40:
                    relationshipScore.output1 = 6
                    relationshipScore.output2 = 3
                    break
                case score[element] >= 30:
                    relationshipScore.output1 = 7
                    relationshipScore.output2 = 4
                    break
                case score[element] >= 20:
                    relationshipScore.output1 = 5
                    relationshipScore.output2 = 6
                    break
                case score[element] >= 10:
                    relationshipScore.output1 = 3
                    relationshipScore.output2 = 4
                    break
                case score[element] > 0:
                    relationshipScore.output1 = 2
                    relationshipScore.output2 = 3
                    break
                case score[element] == 0:
                    relationshipScore.output1 = 0
                    relationshipScore.output2 = 1
                    break
            }
        } else if (relationship == 'Wealth') {
            switch (true) {
                case score[element] >= 80:
                    relationshipScore.wealth1 = 7
                    relationshipScore.wealth2 = 1
                    break
                case score[element] >= 70:
                    relationshipScore.wealth1 = 7
                    relationshipScore.wealth2 = 1
                    break
                case score[element] >= 60:
                    relationshipScore.wealth1 = 7
                    relationshipScore.wealth2 = 2
                    break
                case score[element] >= 50:
                    relationshipScore.wealth1 = 6
                    relationshipScore.wealth2 = 3
                    break
                case score[element] >= 40:
                    relationshipScore.wealth1 = 6
                    relationshipScore.wealth2 = 4
                    break
                case score[element] >= 30:
                    relationshipScore.wealth1 = 5
                    relationshipScore.wealth2 = 5
                    break
                case score[element] >= 20:
                    relationshipScore.wealth1 = 4
                    relationshipScore.wealth2 = 6
                    break
                case score[element] >= 10:
                    relationshipScore.wealth1 = 4
                    relationshipScore.wealth2 = 4
                    break
                case score[element] > 0:
                    relationshipScore.wealth1 = 3
                    relationshipScore.wealth2 = 3
                    break
                case score[element] == 0:
                    relationshipScore.wealth1 = 2
                    relationshipScore.wealth2 = 2
                    break
            }
        } else if (relationship == 'Control') {
            switch (true) {
                case score[element] >= 80:
                    relationshipScore.control1 = 7
                    relationshipScore.control2 = 4
                    break
                case score[element] >= 70:
                    relationshipScore.control1 = 7
                    relationshipScore.control2 = 5
                    break
                case score[element] >= 60:
                    relationshipScore.control1 = 6
                    relationshipScore.control2 = 5
                    break
                case score[element] >= 50:
                    relationshipScore.control1 = 5
                    relationshipScore.control2 = 4
                    break
                case score[element] >= 40:
                    relationshipScore.control1 = 4
                    relationshipScore.control2 = 3
                    break
                case score[element] >= 30:
                    relationshipScore.control1 = 4
                    relationshipScore.control2 = 4
                    break
                case score[element] >= 20:
                    relationshipScore.control1 = 3
                    relationshipScore.control2 = 4
                    break
                case score[element] >= 10:
                    relationshipScore.control1 = 2
                    relationshipScore.control2 = 3
                    break
                case score[element] > 0:
                    relationshipScore.control1 = 1
                    relationshipScore.control2 = 2
                    break
                case score[element] == 0:
                    relationshipScore.control1 = 0
                    relationshipScore.control2 = 1
                    break
            }
        }
    }

    return relationshipScore
}

function getPersonal(score, dayMaster) {
    const master = {
        element: dayMaster,
        score: score[dayMaster],
        strength: getDayMasterStrength(dayMaster, score),
        strengthScore: getDayMasterStrengthScore(dayMaster, score),
    }

    const sorted = Object.entries(score).sort((a, b) => b[1] - a[1])

    const [maxElement, maxScore] = sorted[0]
    const [secondMaxElement, secondMaxScore] = sorted[1]
    const [minElement, minScore] = sorted[sorted.length - 1]

    const max = {
        element: maxElement,
        score: maxScore,
        delta: maxScore - score[dayMaster],
        relationship: getRelationship(dayMaster, maxElement),
    }

    const second = {
        element: secondMaxElement,
        score: secondMaxScore,
        delta: secondMaxScore - score[dayMaster],
        relationship: getRelationship(dayMaster, secondMaxElement),
    }

    const min = {
        element: minElement,
        score: minScore,
        delta: minScore - score[dayMaster],
        relationship: getRelationship(dayMaster, minElement),
    }

    const personal = { master, max, second, min }

    return personal
}

function getPersonalText(dayMaster, dayMasterStrengthScore) {
    let text = ''
    let strength = ''

    if (dayMasterStrengthScore > 70) {
        strength = 'Extremly Strong'

        if (dayMaster == 'Yin Wood') {
            text =
                'เป็นคนมั่นใจสูง ยึดมั่นในแนวคิดตน ดื้อเงียบ วางอำนาจผ่านความอ่อนโยน อาจยึดติด หรือควบคุมคนรอบข้างมากไป ควรเปิดใจฟังผู้อื่น จะยิ่งงอกงาม'
        }
        if (dayMaster == 'Yang Wood') {
            text =
                'เปรียบเสมือนไม้ใหญ่ในป่าทึบ แข็งแกร่งและไม่ยอมงอ มีอุดมการณ์แรงกล้า แต่มัก แข็งเกิน ดื้อดึง ไม่ฟังใคร ต้องเรียนรู้การยืดหยุ่นและใช้เหตุผลมากกว่าอารมณ์'
        }
        if (dayMaster == 'Yin Fire') {
            text =
                'เปรียบเสมือนเปลวไฟแรงจัด ร้อนรุ่ม ใจร้อน อารมณ์ขึ้นไว ชอบควบคุม แต่มีพลังสร้างแรงบันดาลใจสูง เมื่อใช้ถูกทางจะเป็น แสงนำทางให้ผู้อื่น แต่ถ้าเกินสมดุลจะเผาผลาญทั้งตนเองและคนรอบข้าง'
        }
        if (dayMaster == 'Yang Fire') {
            text =
                'เปรียบเหมือนดวงอาทิตย์กลางฤดูร้อน ส่องแรงจนเผาผลาญทุกสิ่ง มีพลังและศักยภาพสูงมาก แต่ถ้าไม่รู้จักพัก จะกลายเป็น ไฟแรงแต่ไม่มีสมดุล ต้องฝึกความอ่อนโยนและยอมฟังผู้อื่น'
        }
        if (dayMaster == 'Yin Earth') {
            text =
                'ดินหนาและแน่นมากจนกลายเป็น ดินอุดตัน มีพลังสูงแต่ยึดติด คิดมาก ห่วงทุกอย่าง จนขาดการเปลี่ยนแปลง มักชอบควบคุมและยากจะยอมรับความเห็นใหม่ ต้องเรียนรู้การปล่อยวางและไว้วางใจผู้อื่น'
        }
        if (dayMaster == 'Yang Earth') {
            text =
                'เปรียบเสมือนภูเขาสูงและแข็งแกร่งเกินไป มั่นคงแต่ปิดกั้นทุกอย่าง ดื้อ ดันทุรัง ไม่ฟังคำแนะนำ มักยึดมั่นในความเชื่อของตนจนยากปรับตัว ต้องเรียนรู้การเปิดใจและยอมรับการเปลี่ยนแปลง เพื่อไม่ให้กลายเป็น กำแพงที่โดดเดี่ยว'
        }
        if (dayMaster == 'Yin Metal') {
            text =
                'โลหะเงาวับแต่แข็งเกินไป ภายนอกดูสง่า แต่ภายในอาจดื้อ ยึดมั่นในความถูกต้องของตนเอง ชอบตัดสินผู้อื่น และมีมาตรฐานสูงเกินไป ต้องฝึกปล่อยวางและยอมรับความไม่สมบูรณ์แบบของโลก'
        }
        if (dayMaster == 'Yang Metal') {
            text =
                'ดาบใหญ่ที่คมเกินพอดี เด็ดเดี่ยว กล้าหาญ แต่แข็งกระด้าง ดื้อ ไม่ฟังใคร มักมองโลกแบบขาวดำ ยึดมั่นในหลักการของตนจนไม่ยอมประนีประนอม ต้องเรียนรู้การใช้เหตุผลและเมตตา เพื่อให้พลังนี้เป็นประโยชน์'
        }
        if (dayMaster == 'Yin Water') {
            text =
                'เหมือนฝนตกหนักจนท่วม ฉลาดเฉียบไว มีความคิดซับซ้อน เข้าใจทุกสิ่งแต่ควบคุมตนเองยาก อารมณ์ขึ้นลงแรง มักคิดลึกเกินไปหรือวิตกจริต ควรฝึกการปล่อยวางและหาความสงบในใจ'
        }
        if (dayMaster == 'Yang Water') {
            text =
                'เหมือนมหาสมุทรช่วงพายุ พลังมาก คิดเร็ว ทำเร็ว กล้าทำในสิ่งใหญ่ แต่ไม่ฟังใครและยากควบคุม อาจใจร้อน วู่วาม หรือหลงอุดมการณ์ ต้องเรียนรู้การใช้พลังอย่างมีขอบเขต เพื่อไม่ให้น้ำท่วมทุกอย่างรอบตัว'
        }
    } else if (dayMasterStrengthScore > 50) {
        strength = 'Very Strong'

        if (dayMaster == 'Yin Wood') {
            text =
                'เป็นคนใจแข็งในแบบนุ่มนวล เด็ดขาดแต่ไม่ก้าวร้าว เหมาะเป็นผู้นำที่ใช้การโน้มน้าว ถ้าเกินสมดุลจะดื้อ หรือไม่ยอมเปลี่ยนทิศทาง ควรเรียนรู้ความยืดหยุ่น'
        }
        if (dayMaster == 'Yang Wood') {
            text =
                'เป็นผู้นำโดยธรรมชาติ มีจิตใจนักสู้ อดทนสูง ยืนหยัดเพื่อความถูกต้อง แต่บางครั้งยึดหลักเกินไป จนยากจะรับมุมมองใหม่ ควรฝึกฟังและยอมปรับ'
        }
        if (dayMaster == 'Yin Fire') {
            text =
                'เป็นคนฉลาดเฉียบไว ใจร้อนบ้าง พูดจาตรงแต่เจตนาดี ชอบเป็นคนเด่นและสร้างอิทธิพล เหมาะกับงานที่ต้องใช้พลังจิตใจและความคิดสร้างสรรค์ ต้องระวังความเหนื่อยล้าทางอารมณ์และความคาดหวังสูง'
        }
        if (dayMaster == 'Yang Fire') {
            text =
                'แกร่ง อุดมการณ์ชัด เป็นผู้นำโดยธรรมชาติ มีแรงบันดาลใจสูง รักความจริงใจและความยุติธรรม แต่บางครั้งพูดตรงเกินหรือยึดอัตตา ควรเสริมความละเอียดและฟังความเห็นคนรอบข้าง'
        }
        if (dayMaster == 'Yin Earth') {
            text =
                'ดินอุดมสมบูรณ์ มีความรับผิดชอบสูง ใจดี มีเมตตาแต่ไม่ค่อยแสดงออก ชอบดูแลผู้อื่นแต่ลืมดูแลตัวเอง ถ้าเกินสมดุลจะกลายเป็นคน เก็บทุกอย่างไว้ จนรู้สึกหนัก'
        }
        if (dayMaster == 'Yang Earth') {
            text =
                'เปรียบเสมือนภูเขาใหญ่ทรงพลัง มีอำนาจ มีวุฒิภาวะสูง รับผิดชอบได้ดี เป็นที่พึ่งของผู้อื่น แต่บางครั้งแบกรับมากเกินไปหรือไม่ยอมขอความช่วยเหลือ ต้องฝึกปล่อยบางส่วน เพื่อรักษาสมดุลพลัง'
        }
        if (dayMaster == 'Yin Metal') {
            text =
                'เพชรที่เจียระไนสมบูรณ์ ฉลาด ละเอียด รอบคอบ มีสุนทรียะสูง เป็นผู้นำที่ใช้น้ำเสียงและภาพลักษณ์มากกว่าอำนาจ แต่บางครั้งเย็นชาเกินไปหรือระวังตัวมากจนขาดความอบอุ่น'
        }
        if (dayMaster == 'Yang Metal') {
            text =
                'เหล็กแข็งผ่านการตีขึ้นรูป เป็นผู้นำที่กล้า ยุติธรรม ชัดเจนในหลักการและเป้าหมาย มีพลังการตัดสินใจสูง แต่ถ้าขาดความยืดหยุ่นจะกลายเป็นคนเคร่ง เครียด และขาดความเข้าใจด้านอารมณ์ผู้อื่น'
        }
        if (dayMaster == 'Yin Water') {
            text =
                'น้ำลึกมาก ฉลาด ละเอียด เข้าใจคนแต่บางครั้งอ่านมากไป จนเหนื่อยใจ มีเสน่ห์ทางคำพูดและความเข้าใจผู้อื่น เหมาะกับงานวิเคราะห์หรือที่ต้องใช้จิตวิทยา แต่ควรระวังความกังวลและความคิดล้น'
        }
        if (dayMaster == 'Yang Water') {
            text =
                'กระแสน้ำเชี่ยว ฉลาด หัวไว มีพลังขับเคลื่อนสูง รักอิสระ กล้าคิดกล้าทำ แต่บางครั้งใจร้อนหรือเปลี่ยนทิศทางไวเกิน ควรเพิ่มความมั่นคงและวางแผนก่อนเคลื่อนไหว'
        }
    } else if (dayMasterStrengthScore > 30) {
        strength = 'Strong'

        if (dayMaster == 'Yin Wood') {
            text =
                'เป็นคนมีพลังสร้างสรรค์สูง มั่นคง รักการเติบโต สามารถนำผู้อื่นด้วยวาทศิลป์ ถ้าขาดสมดุลอาจดูจู้จี้หรือคาดหวังสูงเกิน'
        }
        if (dayMaster == 'Yang Wood') {
            text =
                'เป็นคนมีจุดยืนชัด ซื่อสัตย์ รับผิดชอบสูง เป็น ไม้ใหญ่มีร่มเงา ที่คนพึ่งพาได้ เหมาะเป็นหัวหน้า นักวางกลยุทธ์ หรือผู้ให้คำปรึกษา แต่ควรลดการวิจารณ์คนอื่น'
        }
        if (dayMaster == 'Yin Fire') {
            text =
                'เป็นคนมีเสน่ห์ อบอุ่น พูดจาเก่ง มีแรงผลักดันสูง เข้าใจอารมณ์คนรอบข้าง แต่บางครั้งคิดมากหรืออ่อนไหวเกินไป ถ้าใช้พลังความเข้าใจและเมตตาอย่างมีขอบเขต จะเป็นผู้นำที่มีทั้งหัวใจและปัญญา'
        }
        if (dayMaster == 'Yang Fire') {
            text =
                'ใจกว้าง อบอุ่น สร้างพลังบวกให้ผู้อื่น เหมือนดวงอาทิตย์ยามสาย สว่างแต่ไม่เผา เหมาะกับงานที่เป็นผู้นำหรือสร้างแรงบันดาลใจ แต่ควรระวัง ใจร้อนตัดสินเร็วเกินไป'
        }
        if (dayMaster == 'Yin Earth') {
            text =
                'มีเสถียรภาพ อดทน มั่นคง ใจดี มีความสามารถในการรองรับผู้อื่น เหมาะกับงานที่ต้องใช้ความละเอียดและการสนับสนุนเบื้องหลัง แต่บางครั้งช้าและลังเลในการเปลี่ยนแปลง'
        }
        if (dayMaster == 'Yang Earth') {
            text =
                'เป็นคนมั่นคง มีศักดิ์ศรี ซื่อสัตย์ต่อหน้าที่และอุดมการณ์ เหมือนภูเขาที่ให้ร่มเงาแก่ผู้อื่น เหมาะกับตำแหน่งผู้นำหรือที่ต้องดูแลคนจำนวนมาก แต่ควรลดความดื้อและเปิดรับความคิดใหม่ๆ'
        }
        if (dayMaster == 'Yin Metal') {
            text =
                'แกร่ง สง่างาม มีเสน่ห์และมีชั้นเชิง เป็นคนมีรสนิยมและเข้าใจคน เหมาะกับงานด้านความงาม ศิลปะ การจัดการ และการประเมินค่า ต้องระวังไม่ให้ความสมบูรณ์แบบกลายเป็นการวิจารณ์ตนเองมากเกินไป'
        }
        if (dayMaster == 'Yang Metal') {
            text =
                'เหล็กที่แกร่งและมีรูปทรง ซื่อตรง มีความรับผิดชอบ และกล้าปกป้องผู้อื่น เป็นคนตรงไปตรงมาแต่มีศักดิ์ศรี เหมาะกับงานที่ต้องการความมั่นใจและจิตวิญญาณนักสู้ แต่ควรระวังคำพูดตรงเกินจนทำร้ายใจคนอื่น'
        }
        if (dayMaster == 'Yin Water') {
            text =
                'น้ำที่ใสและลึก มีไหวพริบ ปรับตัวเก่ง เข้าใจอารมณ์คนรอบข้าง เป็นผู้ฟังที่ดีและมีพลังบำบัด แต่บางครั้งอาจลังเลหรือตัดสินใจช้าเพราะคิดมากเกินไป ควรเชื่อในสัญชาตญาณของตนเองมากขึ้น'
        }
        if (dayMaster == 'Yang Water') {
            text =
                'กระแสน้ำแรงแต่ควบคุมได้ มีวิสัยทัศน์ มองไกล เข้าใจโลกและผู้คน ชอบเรียนรู้สิ่งใหม่ เป็นน้ำที่พร้อมขับเคลื่อนคนอื่น เหมาะกับงานผู้นำ นักกลยุทธ์ หรือผู้บุกเบิก'
        }
    } else if (dayMasterStrengthScore > 10) {
        strength = 'Fairly Strong'

        if (dayMaster == 'Yin Wood') {
            text =
                'เป็นคนอ่อนโยนแต่ไม่อ่อนแอ สามารถยืนได้ด้วยตนเอง เหมาะกับงานใช้ความสัมพันธ์และการเจรจา ต้องระวังอารมณ์ผันผวนเมื่อเจอแรงกดดัน'
        }
        if (dayMaster == 'Yang Wood') {
            text =
                'เป็นคนเด็ดเดี่ยวแต่มีน้ำใจ รักความยุติธรรมและพัฒนา เหมาะกับงานบริหารหรือที่ต้องการความมั่นคง แต่บางครั้งคิดช้า ตัดสินช้า ควรฝึกความเร็วในการตัดสินใจ'
        }
        if (dayMaster == 'Yin Fire') {
            text =
                'เปรียบเสมือนเทียนที่ให้แสงพอดี อบอุ่น สร้างบรรยากาศ เข้าใจจิตใจผู้อื่น เหมาะกับงานด้านศิลปะ คำพูด การสื่อสาร ต้องระวัง ไฟดับไว เมื่อเหนื่อยหรือไม่ได้รับกำลังใจ'
        }
        if (dayMaster == 'Yang Fire') {
            text =
                'มีพลังแผ่วลงแต่ยังส่องสว่าง ชอบให้ความช่วยเหลือ อารมณ์ดีแต่บางครั้งหมดแรงง่ายเมื่อไม่ได้รับการยอมรับ ควรรู้จักเก็บพลังและแบ่งเวลาให้ตัวเองบ้าง'
        }
        if (dayMaster == 'Yin Earth') {
            text =
                'ดินร่วนพอดี อ่อนโยน มีเหตุผล และยืดหยุ่นพอสมควร มักเป็นคนอบอุ่น ชอบช่วยเหลือแต่รู้ลิมิตตัวเอง เหมาะกับงานบริหารหรือสนับสนุนที่ต้องใช้ความเข้าใจและความใจเย็น'
        }
        if (dayMaster == 'Yang Earth') {
            text =
                'เปรียบเสมือนภูเขาที่มั่นคงแต่ยังมีน้ำซึมได้ หนักแน่น มีเหตุผล ไม่เร่งรีบเกินไป มีวินัยและจิตใจมั่นคง เหมาะกับงานที่ต้องการความอดทนและความรับผิดชอบ แต่ควรระวังความเฉื่อยหรือความช้าเกินไป'
        }
        if (dayMaster == 'Yin Metal') {
            text =
                'โลหะที่ขัดเงาพอดี ดูดี มีวุฒิภาวะทางอารมณ์ มีมารยาท และรู้กาลเทศะ มักเป็นที่ชื่นชอบในสังคม เหมาะกับงานสื่อสาร การประสานงาน การตลาด หรือที่ต้องใช้ภาพลักษณ์และวาทศิลป์'
        }
        if (dayMaster == 'Yang Metal') {
            text =
                'โลหะที่ผ่านการขัดเกลา มีความเด็ดขาดพอดี รู้จักใช้พลังในเวลาที่เหมาะ เป็นคนมีวินัย มีเกียรติ รักษาคำพูด เหมาะกับตำแหน่งผู้นำที่ต้องการทั้งแข็งและนุ่ม ในเวลาเดียวกัน'
        }
        if (dayMaster == 'Yin Water') {
            text =
                'น้ำที่ไหลนุ่มนวล มีเสน่ห์ อ่อนโยน มีความคิดสร้างสรรค์ ชอบช่วยเหลือคนอื่น แต่บางครั้งจะเหนื่อยใจง่าย ควรฝึกตั้งขอบเขตให้ตัวเอง เพื่อไม่ให้ความเห็นอกเห็นใจกลายเป็นการดูดพลังตน'
        }
        if (dayMaster == 'Yang Water') {
            text =
                'แม่น้ำที่ไหลมั่นคง มีพลังสร้างสรรค์ ฉลาดแต่ไม่ดื้อ มีความยืดหยุ่นพอดี ชอบช่วยคนอื่นและเป็นแรงบันดาลใจ เหมาะกับบทบาทที่ต้องคิด วิเคราะห์ และปรับตัวอย่างต่อเนื่อง'
        }
    } else if (dayMasterStrengthScore > -10) {
        strength = 'Balanced'

        if (dayMaster == 'Yin Wood') {
            text =
                'สมดุลระหว่างอ่อนโยนและเด็ดขาด มีทั้งความคิดสร้างสรรค์และเหตุผล สามารถรับมือสถานการณ์ได้ดี เหมาะกับบทบาท ที่ปรับได้ทุกสถานการณ์'
        }
        if (dayMaster == 'Yang Wood') {
            text =
                'สมดุลระหว่างความมั่นคงและความยืดหยุ่น มักเป็นคนมีเหตุผล มีวุฒิภาวะ เป็น ไม้ใหญ่กลางทุ่ง ที่ให้ร่มเงาและรับแสงพอดี เหมาะกับงานบริหาร งานที่ต้องดูแลผู้อื่น'
        }
        if (dayMaster == 'Yin Fire') {
            text =
                'สมดุลระหว่างพลังและความอ่อนโยน เข้าใจโลกและจิตใจ แสงของเขาอบอุ่น ไม่แผดเผา รู้จักพักและรู้จักให้ เหมาะกับบทบาทที่ต้องใช้ทั้งอารมณ์ เหตุผล และสติ'
        }
        if (dayMaster == 'Yang Fire') {
            text =
                'ดวงอาทิตย์ยามบ่าย สมดุลพอดี อบอุ่น มีเมตตา และให้แสงในจังหวะที่เหมาะ เป็นไฟ ที่มีทั้งพลังและปัญญา เหมาะกับงานที่ต้องการแรงบันดาลใจและความเข้าใจผู้อื่น'
        }
        if (dayMaster == 'Yin Earth') {
            text =
                'สมดุลระหว่างความมั่นคงและการปรับตัว เป็นดินที่ปลูกพืชได้ดี ให้คนอื่นเติบโตได้โดยไม่สูญเสียตัวเอง มีทั้งความมั่นใจ ความเมตตา และความยืดหยุ่น เป็นดินในภาวะสมบูรณ์ที่สุด'
        }
        if (dayMaster == 'Yang Earth') {
            text =
                'เปรียบเสมือนภูเขาที่งดงามมั่นคงพอดี หนักแน่นแต่ยืดหยุ่น มีเหตุผลและเมตตา รู้จักรักษาคำพูดและรู้เวลาเปิดใจ มีทั้งความเชื่อมั่นและความเข้าใจ เหมาะกับบทบาทที่ต้องเป็นศูนย์กลางของทีม'
        }
        if (dayMaster == 'Yin Metal') {
            text =
                'โลหะเงางามพอดี สมดุลระหว่างความเข้มแข็งและความอ่อนโยน เป็นคนมีเสน่ห์ ละเอียด แต่ไม่เย็นชา รู้จักให้อภัยและเข้าใจจิตใจคน เหมาะกับบทบาทที่ต้องเชื่อมโยงคนกับคุณค่า'
        }
        if (dayMaster == 'Yang Metal') {
            text =
                'เหล็กกล้าที่มีความยืดหยุ่น สมดุลระหว่างความแข็งกับเมตตา เป็นคนกล้าแต่ไม่ก้าวร้าว ซื่อสัตย์แต่เข้าใจมนุษย์ เป็นนักรบที่มีหัวใจ เหมาะกับการเป็นผู้นำ ทีมงาน หรือผู้พิทักษ์ในองค์กร'
        }
        if (dayMaster == 'Yin Water') {
            text =
                'น้ำใสที่สะท้อนทุกอย่างอย่างพอดี ฉลาด ลึกซึ้ง และมั่นคงทางอารมณ์ มีทั้งเมตตาและเหตุผล เป็นน้ำที่ดีที่สุด เพราะรู้จักไหลไปแต่ไม่หลงทาง สามารถรับแรงกดดันได้โดยไม่สูญเสียตัวตน'
        }
        if (dayMaster == 'Yang Water') {
            text =
                'น้ำสมดุล มีพลังและความนิ่งในตัว รู้จักปรับไหลตามสถานการณ์แต่ไม่สูญเสียทิศทาง เป็นคนมองไกล ใจกว้าง และมีความสงบภายใน เหมาะกับผู้นำที่ใช้สติและสัญชาตญาณควบคู่กัน'
        }
    } else if (dayMasterStrengthScore > -30) {
        strength = 'Fairly Weak'

        if (dayMaster == 'Yin Wood') {
            text =
                'เป็นคนนุ่มนวลเกินไป ลังเล ขาดพลังผลักดัน มักรอจังหวะหรือการยืนยันจากคนอื่น ควรฝึกตัดสินใจด้วยตนเอง เสริมพลังด้วยกิจกรรมกลางแจ้งหรือศิลปะ'
        }
        if (dayMaster == 'Yang Wood') {
            text =
                'เปรียบเสมือนไม้โตแต่ดินหลวม ยังมั่นคงแต่ไม่มั่นใจในรากฐาน ตัดสินใจได้แต่ลังเลตอนลงมือ ต้องเสริมวินัยและเพิ่มพลังภายใน เช่น ออกกำลังกาย หรือ อยู่ในสังคมที่ให้แรงบันดาลใจ'
        }
        if (dayMaster == 'Yin Fire') {
            text =
                'เปรียบเสมือนเปลวไฟอ่อน ใจดีแต่ลังเล ต้องการการยืนยันจากคนอื่น พลังความมั่นใจยังไม่พอ ควรเสริมไฟด้วยแรงบันดาลใจ กิจกรรมสร้างความภาคภูมิใจ และอยู่ใกล้คนที่ให้พลัง'
        }
        if (dayMaster == 'Yang Fire') {
            text =
                'เหมือนดวงอาทิตย์ในวันที่เมฆบัง ยังมีพลังแต่ไม่ส่องออก ชอบช่วยผู้อื่นแต่ขาดความมั่นใจ ควรเสริมไฟด้วยกิจกรรมที่เติมแรงใจ เช่น ออกกำลังกาย การสอน หรือสร้างแรงบันดาลใจให้คนอื่น'
        }
        if (dayMaster == 'Yin Earth') {
            text =
                'ดินเริ่มแห้ง ขาดน้ำหล่อเลี้ยง ใจดีแต่เหนื่อยง่าย พยายามรับผิดชอบเกินกำลัง ต้องการการดูแลหรือแรงสนับสนุนจากคนอื่น ควรเติมพลังด้วยการพักและหาความสุขเล็กๆ ในชีวิต'
        }
        if (dayMaster == 'Yang Earth') {
            text =
                'เปรียบเสมือนดินเริ่มสั่นไหว ยังมีความมั่นคงแต่ขาดความเชื่อมั่นในตัวเอง มักลังเลเวลาเผชิญแรงกดดัน ต้องการแรงสนับสนุนจากผู้อื่น ควรเสริมพลังด้วยกิจกรรมที่สร้างวินัยและความเชื่อในศักยภาพตนเอง'
        }
        if (dayMaster == 'Yin Metal') {
            text =
                'โลหะเริ่มหม่น ยังมีความงามแต่ขาดความมั่นใจในตนเอง มักลังเลเวลาแสดงออก หรือกลัวการถูกวิจารณ์ ควรเสริมพลังด้วยการฝึกพูดในที่สาธารณะหรือฝึกแสดงตัวตน'
        }
        if (dayMaster == 'Yang Metal') {
            text =
                'เหล็กเริ่มเป็นสนิม ยังคงมีพลังในใจ แต่ไม่กล้าใช้ กลัวการปะทะหรือความผิดพลาด ต้องการแรงกระตุ้นหรือแรงบันดาลใจภายนอก ควรฝึกความเชื่อมั่นในตัวเองผ่านการลงมือทำเล็กๆ อย่างต่อเนื่อง'
        }
        if (dayMaster == 'Yin Water') {
            text =
                'น้ำเริ่มเหือด ใจดีแต่ลังเล ขาดความมั่นใจในความคิดของตน ชอบรอให้คนอื่นตัดสินใจให้ ต้องการการยืนยัน ควรฝึกแสดงออก และเรียนรู้การตัดสินใจเล็กๆ ด้วยตนเอง'
        }
        if (dayMaster == 'Yang Water') {
            text =
                'น้ำนิ่งขาดคลื่น คิดเยอะแต่ขาดแรงผลักดัน อาจลังเลหรือกลัวการเปลี่ยนแปลง ต้องเสริมพลังด้วยกิจกรรมที่ทำให้รู้สึกมีชีวิตชีวา เช่น เดินทาง พบคนใหม่ หรือทำงานสร้างแรงบันดาลใจ'
        }
    } else if (dayMasterStrengthScore > -50) {
        strength = 'Weak'

        if (dayMaster == 'Yin Wood') {
            text =
                'เป็นคนที่ต้องการพึ่งพาผู้อื่นมาก ความมั่นใจต่ำ หลีกเลี่ยงความขัดแย้ง มักถูกมองว่าอ่อนข้อ ควรตั้งเป้าหมายเล็กๆ เพิ่มความเชื่อมั่นและความมั่นคงภายใน'
        }
        if (dayMaster == 'Yang Wood') {
            text =
                'อาจรู้สึกขาดแรงผลักดัน เหมือนไม้โดนลมแรง อาจรู้สึกหมดไฟหรือกลัวความรับผิดชอบ ไม่กล้าพูดในสิ่งที่คิด'
        }
        if (dayMaster == 'Yin Fire') {
            text =
                'เปรียบเสมือนแสงริบหรี่ อ่อนไหวง่าย เสียพลังเมื่อเจอสถานการณ์กดดัน ชอบเก็บทุกอย่างไว้ในใจ ต้องระวังภาวะเหนื่อยล้าทางอารมณ์ ควรเติมพลังด้วยการพักผ่อน ธรรมชาติ หรือศิลปะที่จรรโลงใจ'
        }
        if (dayMaster == 'Yang Fire') {
            text =
                'แสงเริ่มริบหรี่ เหนื่อยง่าย ไม่กล้าแสดงตัวตนหรืออุดมการณ์ ขี้เกรงใจเกินไป มักถูกคนรอบข้างบดบัง ควรอยู่ในสิ่งแวดล้อมที่เปิดรับความอบอุ่นและชื่นชมคุณค่าในตัวเอง'
        }
        if (dayMaster == 'Yin Earth') {
            text =
                'ดินบางหรือชะล้าง ขาดความมั่นใจ มักพยายามทำให้คนอื่นพอใจ แต่ลืมตัวเอง รู้สึกว่าความดีไม่ถูกเห็น ต้องเรียนรู้การปฏิเสธ และให้คุณค่ากับตัวเองมากขึ้น'
        }
        if (dayMaster == 'Yang Earth') {
            text =
                'เปรียบเสมือนภูเขาเริ่มพังทลายบางส่วน อ่อนไหวต่อคำพูดคนอื่น ขาดความมั่นใจในอุดมการณ์ อาจรู้สึกว่าถูกกลืนหรือไม่มีอิทธิพลในสังคม ต้องสร้างรากฐานในใจใหม่ เช่น การตั้งเป้าหมายเล็กๆ ที่ทำได้จริง'
        }
        if (dayMaster == 'Yin Metal') {
            text =
                'โลหะที่ถูกฝุ่นคลุม ซ่อนศักยภาพไว้ ไม่กล้าเปล่งประกาย ขี้เกรงใจและกลัวผิด ควรอยู่ใกล้คนที่ให้แรงบันดาลใจจะช่วยให้พลังกลับคืน'
        }
        if (dayMaster == 'Yang Metal') {
            text =
                'เหล็กที่ยังไม่ผ่านการตีขึ้นรูป ขาดความมั่นใจ ไม่กล้าตัดสินใจ อาจลังเลเวลาต้องเผชิญแรงกดดัน หรือหลีกเลี่ยงความขัดแย้ง'
        }
        if (dayMaster == 'Yin Water') {
            text =
                'น้ำแห้งในบางพื้นที่ ขี้อาย ปิดกั้นความรู้สึก ขาดแรงบันดาลใจ หรือไม่กล้าแสดงความสามารถ มักหลีกเลี่ยงการเผชิญหน้า ควรอยู่ในสิ่งแวดล้อมที่อบอุ่นและคนที่มองเห็นศักยภาพของตน'
        }
        if (dayMaster == 'Yang Water') {
            text =
                'น้ำที่ไหลตื้น ฉลาดแต่ไม่กล้าใช้ศักยภาพ ขาดความมั่นใจ อ่อนไหวต่อสิ่งรอบข้างเกินไป มักตามคนอื่นมากกว่ากำหนดทิศทางเอง ควรตั้งเป้าหมายเล็กๆ เพื่อสร้างความมั่นคงในใจ'
        }
    } else if (dayMasterStrengthScore > -70) {
        strength = 'Very Weak'

        if (dayMaster == 'Yin Wood') {
            text =
                'เปรียบเสมือนไม้เลื้อยที่ไม่มีเสาพยุง อ่อนไหวและสับสนง่าย ต้องการการสนับสนุนและแรงบันดาลใจ ควรอยู่ใกล้คนให้พลังบวกและพัฒนาวินัยในตัวเอง'
        }
        if (dayMaster == 'Yang Wood') {
            text =
                'อาจรู้สึกอ่อนแรง สูญเสียความมั่นคงภายใน ง่ายต่อการหวั่นไหวหรือยอมตามผู้อื่น แม้จะมีอุดมการณ์ดีแต่ขาดแรงทำ ควรหาผู้สนับสนุน และสร้างเป้าหมายระยะสั้นเพื่อฟื้นพลัง'
        }
        if (dayMaster == 'Yin Fire') {
            text =
                'เปรียบเสมือนไฟที่เกือบดับ ไม่กล้าแสดงตัวตน ขาดแรงผลักดัน มักรู้สึกว่าตนไม่มีค่า แต่ในทางกลับกันมีพลังละเอียดซ่อนอยู่ ถ้าได้รับแรงสนับสนุนหรือคำยืนยันที่จริงใจ ไฟนี้จะกลับมาสว่างได้อีกครั้ง'
        }
        if (dayMaster == 'Yang Fire') {
            text =
                'ดวงอาทิตย์ยามค่ำ แสงยังอยู่แต่ส่องไม่ถึง มีความคิดดีแต่ไม่กล้าลงมือ เหมาะกับการอยู่เบื้องหลังมากกว่า ควรสร้างวินัย และเติมพลังด้วยเป้าหมายเล็กๆ เพื่อฟื้นไฟในใจ'
        }
        if (dayMaster == 'Yin Earth') {
            text =
                'ดินพังทลาย จิตใจอ่อนไหว เหนื่อยง่าย รับอารมณ์ผู้อื่นมากเกินไป อาจหลีกเลี่ยงปัญหาและขาดแรงใจ ควรอยู่ในสิ่งแวดล้อมที่อบอุ่น และหาคนที่เข้าใจมาเป็นน้ำหล่อเลี้ยง'
        }
        if (dayMaster == 'Yang Earth') {
            text =
                'เปรียบเสมือนดินแตกร้าว มักรับแรงกดดันไม่ได้ พึ่งพาคนรอบข้างมากไป รู้สึกหมดแรงใจหรือไร้ค่า ควรอยู่ใกล้คนที่ให้แรงบวก เพื่อกระตุ้นแรงผลักดันและโครงสร้างในชีวิต'
        }
        if (dayMaster == 'Yin Metal') {
            text =
                'โลหะที่ถูกฝังในดิน อ่อนไหวมาก รับพลังรอบข้างง่ายเกินไป จิตใจอ่อนโยนแต่เปราะบาง มักยอมคนเพื่อเลี่ยงความขัดแย้ง ต้องเริ่มจากการยอมรับคุณค่าในตัวเองและกล้าเปล่งแสงออกมา'
        }
        if (dayMaster == 'Yang Metal') {
            text =
                'โลหะดิบที่ฝังในดิน ศักยภาพสูงแต่ไม่ถูกขุดขึ้นมา ไม่กล้าแสดงออก อ่อนไหวต่อคำพูดคนอื่นเกินไป ต้องอยู่ในสิ่งแวดล้อมที่ส่งเสริมให้กล้าแสดงตัวตนหรือมีคนผลักดัน'
        }
        if (dayMaster == 'Yin Water') {
            text =
                'น้ำตกค้างในอากาศ อ่อนไหวสูง รู้สึกเหนื่อยทางอารมณ์ง่าย ขาดความมั่นคงในใจ และกลัวการถูกปฏิเสธ'
        }
        if (dayMaster == 'Yang Water') {
            text =
                'น้ำที่แห้งขาดแหล่งหล่อเลี้ยง หมดไฟทางใจ ขาดแรงผลักดันหรือเป้าหมาย รู้สึกถูกจำกัดหรือถูกกักไว้ ต้องหากำลังใจจากคนรอบข้าง และเติมพลังผ่านสิ่งที่กระตุ้น ความอยากรู้อยากสร้าง'
        }
    } else {
        strength = 'Extremely Weak'

        if (dayMaster == 'Yin Wood') {
            text =
                'อาจรู้สึกสูญเสียทิศทาง หมดแรงผลักดัน มักหลีกหนีความจริงหรือกลายเป็นคนตามใจคนอื่นมากเกินไป การฝึกวินัย การออกกำลังกาย และอยู่ใกล้ธรรมชาติจะช่วยเสริมธาตุไม้ให้ฟื้นตัว'
        }
        if (dayMaster == 'Yang Wood') {
            text =
                'เปรียบเสมือนไม้ใหญ่ถูกถอนราก ขาดทั้งพลังและทิศทาง อาจหมดศรัทธาในตัวเองหรือหลีกหนีความจริง ต้องเริ่มจาก ปลูกใหม่ในดินดี เปลี่ยนสภาพแวดล้อม เติมแรงบันดาลใจ และอยู่ใกล้คนเข้มแข็ง'
        }
        if (dayMaster == 'Yin Fire') {
            text =
                'เปรียบเสมือนเปลวเทียนใกล้ดับ หมดแรงใจ มองไม่เห็นแสงของตนเอง อาจหนีความจริงหรือปิดใจ ต้องเริ่มจากจุดไฟใหม่ พักกายใจ กลับสู่สิ่งเรียบง่าย และค่อยเติมพลังด้วยความอบอุ่นจากคนรอบข้าง'
        }
        if (dayMaster == 'Yang Fire') {
            text =
                'ไร้แสงในความมืด เหมือนไฟที่ดับไปแล้ว หมดแรงใจ ขาดแรงจูงใจ ไม่เชื่อว่าตัวเองมีค่า ต้องเริ่มต้นใหม่อย่างอ่อนโยน อยู่กับคนที่มองเห็นคุณค่า และปล่อยให้ไฟค่อยๆ จุดกลับขึ้นมาอีกครั้ง'
        }
        if (dayMaster == 'Yin Earth') {
            text =
                'ดินแตกระแหง หมดแรงใจ หมดศรัทธาในตัวเอง รู้สึกไม่มีคุณค่า ต้องเริ่มจาก บำรุงรากฐาน ทั้งร่างกายและจิตใจ เช่น ดูแลสุขภาพ พักผ่อน ใกล้ชิดธรรมชาติ เพื่อฟื้นพลังชีวิตกลับมาใหม่'
        }
        if (dayMaster == 'Yang Earth') {
            text =
                'เปรียบเสมือนภูเขายุบลงเป็นพื้นราบ สูญเสียความมั่นคงทั้งภายนอกและภายใน ขาดทิศทาง ไม่กล้าตัดสินใจ รู้สึกไม่สามารถพึ่งตัวเองได้ ต้องเริ่มจากการวางรากฐานใหม่ ทั้งด้านจิตใจ ร่างกาย และสิ่งแวดล้อม เพื่อสร้างพลังคืนกลับ'
        }
        if (dayMaster == 'Yin Metal') {
            text =
                'โลหะที่ขาดการหล่อหลอม หมดแรงใจและศรัทธาในตนเอง รู้สึกไร้ค่า ขาดแรงผลักดัน ต้องเริ่มจากการหลอมใหม่ พักใจ อยู่กับความสงบ และค่อยๆสร้างพลังผ่านกิจกรรมที่ฟื้นความงามในใจ เช่น ศิลปะ ดนตรี หรือธรรมชาติ'
        }
        if (dayMaster == 'Yang Metal') {
            text =
                'โลหะที่หลอมละลาย สูญเสียความมั่นใจ หมดแรงใจ และอาจยอมตามผู้อื่นโดยไม่กล้าปกป้องตัวเอง ต้องเริ่มจากการสร้างความมั่นคงภายใน เช่น ฝึกวินัย ออกกำลังกาย หรืออยู่ใกล้คนที่ให้พลังบวก เพื่อค่อยๆ ฟื้นพลังกลับมา'
        }
        if (dayMaster == 'Yin Water') {
            text =
                'น้ำระเหยหาย สูญเสียแรงใจและศรัทธาในตนเอง รู้สึกสับสนและหมดพลังทางจิตใจ ต้องเริ่มจากเติมน้ำในใจ ผ่านการพักผ่อน ฟังเสียงตนเอง อยู่ในที่สงบ และค่อยๆสร้างความมั่นใจจากสิ่งเล็กๆ ที่สำเร็จได้จริง'
        }
        if (dayMaster == 'Yang Water') {
            text =
                'แหล่งน้ำเหือดแห้ง หมดศรัทธาในตนเอง รู้สึกสับสนและไร้ทิศทาง เหมือนทะเลที่สงบนิ่งจนไร้ชีวิต ต้องเริ่มต้นใหม่อย่างช้าๆ ผ่านการฟื้นฟูภายใน เช่น การทำสมาธิ เดินทางตามธรรมชาติ หรือฟังเสียงหัวใจตนเอง'
        }
    }

    return { dayMaster, dayMasterStrengthScore, text, strength }
}

async function getStatRow(birthday) {
    try {
        const year = new Date(birthday).getFullYear()
        const decade = Math.floor(year / 10) * 10
        const response = await fetch(`/Score_${decade}.xlsx`)

        if (!response.ok) {
            throw new Error('โหลดไฟล์ Excel ไม่ได้')
        }

        const arrayBuffer = await response.arrayBuffer()
        const data = new Uint8Array(arrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })

        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]

        const rows = XLSX.utils.sheet_to_json(sheet, { header: 'A' })

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i]
            if (row['A'] === birthday) {
                return row
            }
        }
    } catch (err) {
        console.log(err.message)
        return
    }
}

function getStat(statRow) {
    const balanceDecade = statRow['Y']
    const balanceYear = statRow['Z']
    const balanceMonth = statRow['AA']

    const supportDecade = statRow['AB']
    const supportYear = statRow['AC']
    const supportMonth = statRow['AD']

    const selfDecade = statRow['AE']
    const selfYear = statRow['AF']
    const selfMonth = statRow['AG']

    const outputDecade = statRow['AH']
    const outputYear = statRow['AI']
    const outputMonth = statRow['AJ']

    const wealthDecade = statRow['AK']
    const wealthYear = statRow['AL']
    const wealthMonth = statRow['AM']

    const controlDecade = statRow['AN']
    const controlYear = statRow['AO']
    const controlMonth = statRow['AP']

    const stat = []

    /* --- CONTROL -- */

    if (controlDecade == 1) {
        stat.push({
            type: 'control',
            timeline: 'decade',
            rank: 'top1',
            score: 4,
            text: `วันเกิดนี้เป็นวันที่พลังการควบคุมสูงที่สุดในรอบ 10 ปี (ค.ศ. XXXX–XXXX) ซึ่งเป็นวันค่อนข้างหายาก ทำให้จริงจังและคิดถึงหน้าที่มากกว่าปกติ
                แต่เพราะพลังแรงเกินไป อาจรู้สึกเหมือนเจอแรงกดดันจากภายนอก ถูกคาดหวังเยอะ หรือโดนบังคับจากสถานการณ์ต่างๆ ควรผ่อนคลายและไม่กดตัวเองจนเกินไป`,
        })
    } else if (controlDecade <= 30) {
        stat.push({
            type: 'control',
            timeline: 'decade',
            rank: 'top30',
            score: 16,
            text: `วันเกิด XX/XX/XXXX อยู่ในกลุ่มวันที่พลังอำนาจสูงติด Top 30 ของค.ศ. XXXX-XXXX
                ทำให้จริงจัง รับผิดชอบ และระวังตัวมาก
                แต่พลังนี้มากเกินไปอาจรู้สึกเหมือนถูกบังคับ กดดันจากภายนอก หรือเจอคำวิจารณ์ง่าย ควรอย่าตึงเกินไปและรู้จักปล่อยวางบ้าง`,
        })
    } else if (controlDecade <= 150) {
        stat.push({
            type: 'control',
            timeline: 'decade',
            rank: 'top150',
            score: 34,
        })
    } else if (controlDecade <= 500) {
        stat.push({
            type: 'control',
            timeline: 'decade',
            rank: 'top500',
            score: 46,
        })
    } else if (controlDecade >= 3000) {
        stat.push({
            type: 'control',
            timeline: 'decade',
            rank: 'least3000',
            score: 64,
        })
    } else if (controlDecade >= 2500) {
        stat.push({
            type: 'control',
            timeline: 'decade',
            rank: 'least2500',
            score: 82,
        })
    } else if (controlDecade >= 2000) {
        stat.push({
            type: 'control',
            timeline: 'decade',
            rank: 'least2000',
            score: 100,
        })
    }

    if (controlYear == 1) {
        stat.push({
            type: 'control',
            timeline: 'year',
            rank: 'top1',
            score: 10,
        })
    } else if (controlYear <= 10) {
        stat.push({
            type: 'control',
            timeline: 'year',
            rank: 'top10',
            score: 22,
        })
    } else if (controlYear <= 25) {
        stat.push({
            type: 'control',
            timeline: 'year',
            rank: 'top25',
            score: 40,
        })
    } else if (controlYear <= 50) {
        stat.push({
            type: 'control',
            timeline: 'year',
            rank: 'top50',
            score: 52,
        })
    } else if (controlYear >= 300) {
        stat.push({
            type: 'control',
            timeline: 'year',
            rank: 'least300',
            score: 70,
        })
    } else if (controlYear >= 250) {
        stat.push({
            type: 'control',
            timeline: 'year',
            rank: 'least250',
            score: 88,
        })
    } else if (controlYear >= 200) {
        stat.push({
            type: 'control',
            timeline: 'year',
            rank: 'least200',
            score: 106,
        })
    }

    if (controlMonth == 1) {
        stat.push({
            type: 'control',
            timeline: 'month',
            rank: 'top1',
            score: 28,
        })
    } else if (controlMonth <= 5) {
        stat.push({
            type: 'control',
            timeline: 'month',
            rank: 'top5',
            score: 58,
        })
    } else if (controlMonth <= 10) {
        stat.push({
            type: 'control',
            timeline: 'month',
            rank: 'top10',
            score: 76,
        })
    } else if (controlMonth >= 25) {
        stat.push({
            type: 'control',
            timeline: 'month',
            rank: 'least25',
            score: 94,
        })
    } else if (controlMonth >= 20) {
        stat.push({
            type: 'control',
            timeline: 'month',
            rank: 'least20',
            score: 112,
        })
    }

    /* --- WEALTH -- */

    if (wealthDecade == 1) {
        stat.push({
            type: 'wealth',
            timeline: 'decade',
            rank: 'top1',
            score: 5,
            text: `วันเกิดนี้เป็นวันที่พลังด้านผลประโยชน์และการเงินสูงที่สุดในรอบ 10 ปี (ค.ศ. XXXX–XXXX) เป็นวันที่เจอไม่บ่อย ทำให้โฟกัสเรื่องรายได้ การใช้แรงเพื่อให้ได้ผลตอบแทนชัดเจนขึ้น
                แต่เมื่อพลังมากเกินไป อาจทำให้คิดแต่เรื่องเงิน หรือกังวลผลประโยชน์มากไปจนลืมเรื่องอื่น ควรรักษาสมดุลระหว่างงาน เงิน และชีวิตส่วนตัว`,
        })
    } else if (wealthDecade <= 30) {
        stat.push({
            type: 'wealth',
            timeline: 'decade',
            rank: 'top30',
            score: 17,
            text: `วันเกิด XX/XX/XXXX อยู่ในกลุ่มวันที่พลังทรัพย์สูงติด Top 30 ของค.ศ. XXXX–XXXX
                จึงมักคิดเรื่องผลตอบแทนหรือการจัดการเงินอยู่เสมอ
                แต่ถ้ามากไปอาจกลายเป็นคิดแต่เรื่องเงินจนลืมเรื่องอื่น หรือเหนื่อยกับความคาดหวังของตัวเอง ควรผ่อนคลายและแบ่งเวลาให้สมดุล`,
        })
    } else if (wealthDecade <= 150) {
        stat.push({
            type: 'wealth',
            timeline: 'decade',
            rank: 'top150',
            score: 35,
        })
    } else if (wealthDecade <= 500) {
        stat.push({
            type: 'wealth',
            timeline: 'decade',
            rank: 'top500',
            score: 47,
        })
    } else if (wealthDecade >= 3000) {
        stat.push({
            type: 'wealth',
            timeline: 'decade',
            rank: 'least3000',
            score: 65,
        })
    } else if (wealthDecade >= 2500) {
        stat.push({
            type: 'wealth',
            timeline: 'decade',
            rank: 'least2500',
            score: 83,
        })
    } else if (wealthDecade >= 2000) {
        stat.push({
            type: 'wealth',
            timeline: 'decade',
            rank: 'least2000',
            score: 101,
        })
    }

    if (wealthYear == 1) {
        stat.push({
            type: 'wealth',
            timeline: 'year',
            rank: 'top1',
            score: 11,
        })
    } else if (wealthYear <= 10) {
        stat.push({
            type: 'wealth',
            timeline: 'year',
            rank: 'top10',
            score: 23,
        })
    } else if (wealthYear <= 25) {
        stat.push({
            type: 'wealth',
            timeline: 'year',
            rank: 'top25',
            score: 41,
        })
    } else if (wealthYear <= 50) {
        stat.push({
            type: 'wealth',
            timeline: 'year',
            rank: 'top50',
            score: 53,
        })
    } else if (wealthYear >= 300) {
        stat.push({
            type: 'wealth',
            timeline: 'year',
            rank: 'least300',
            score: 71,
        })
    } else if (wealthYear >= 250) {
        stat.push({
            type: 'wealth',
            timeline: 'year',
            rank: 'least250',
            score: 89,
        })
    } else if (wealthYear >= 200) {
        stat.push({
            type: 'wealth',
            timeline: 'year',
            rank: 'least200',
            score: 107,
        })
    }

    if (wealthMonth == 1) {
        stat.push({
            type: 'wealth',
            timeline: 'month',
            rank: 'top1',
            score: 29,
        })
    } else if (wealthMonth <= 5) {
        stat.push({
            type: 'wealth',
            timeline: 'month',
            rank: 'top5',
            score: 59,
        })
    } else if (wealthMonth <= 10) {
        stat.push({
            type: 'wealth',
            timeline: 'month',
            rank: 'top10',
            score: 77,
        })
    } else if (wealthMonth >= 25) {
        stat.push({
            type: 'wealth',
            timeline: 'month',
            rank: 'least25',
            score: 95,
        })
    } else if (wealthMonth >= 20) {
        stat.push({
            type: 'wealth',
            timeline: 'month',
            rank: 'least20',
            score: 113,
        })
    }

    /* --- OUTPUT -- */

    if (outputDecade == 1) {
        stat.push({
            type: 'output',
            timeline: 'decade',
            rank: 'top1',
            score: 6,
            text: `วันเกิดนี้เป็นวันที่พลังการแสดงออกสูงที่สุดในรอบ 10 ปี (ค.ศ. XXXX–XXXX) ซึ่งถือว่าเป็นวันหายาก ทำให้คิดไว พูดไว หรืออยากลงมือทำหลายอย่างพร้อมกัน
                แต่เพราะพลังล้น อาจทำให้ใจร้อน คิดเยอะเกินเหตุ หรือทำอะไรไม่จบ ควรรอบคอบและค่อยๆทำทีละอย่าง`,
        })
    } else if (outputDecade <= 30) {
        stat.push({
            type: 'output',
            timeline: 'decade',
            rank: 'top30',
            score: 18,
            text: `วันเกิด XX/XX/XXXX อยู่ในกลุ่มวันที่พลังการแสดงออกสูงติด Top 30 ของค.ศ. XXXX–XXXX
                ทำให้คิดไว พูดไว มีไอเดียเยอะสลับบ่อย
                แต่เพราะพลังล้น อาจทำให้ใจเร็ว พูดมากไป หรือทำหลายอย่างพร้อมกันจนไม่จบ ควรจัดลำดับให้ชัดขึ้น`,
        })
    } else if (outputDecade <= 150) {
        stat.push({
            type: 'output',
            timeline: 'decade',
            rank: 'top150',
            score: 36,
        })
    } else if (outputDecade <= 500) {
        stat.push({
            type: 'output',
            timeline: 'decade',
            rank: 'top500',
            score: 48,
        })
    } else if (outputDecade >= 3000) {
        stat.push({
            type: 'output',
            timeline: 'decade',
            rank: 'least3000',
            score: 66,
        })
    } else if (outputDecade >= 2500) {
        stat.push({
            type: 'output',
            timeline: 'decade',
            rank: 'least2500',
            score: 84,
        })
    } else if (outputDecade >= 2000) {
        stat.push({
            type: 'output',
            timeline: 'decade',
            rank: 'least2500',
            score: 102,
        })
    }

    if (outputYear == 1) {
        stat.push({
            type: 'output',
            timeline: 'year',
            rank: 'top1',
            score: 12,
        })
    } else if (outputYear <= 10) {
        stat.push({
            type: 'output',
            timeline: 'year',
            rank: 'top10',
            score: 24,
        })
    } else if (outputYear <= 25) {
        stat.push({
            type: 'output',
            timeline: 'year',
            rank: 'top25',
            score: 42,
        })
    } else if (outputYear <= 50) {
        stat.push({
            type: 'output',
            timeline: 'year',
            rank: 'top50',
            score: 54,
        })
    } else if (outputYear >= 300) {
        stat.push({
            type: 'output',
            timeline: 'year',
            rank: 'least300',
            score: 72,
        })
    } else if (outputYear >= 250) {
        stat.push({
            type: 'output',
            timeline: 'year',
            rank: 'least250',
            score: 90,
        })
    } else if (outputYear >= 200) {
        stat.push({
            type: 'output',
            timeline: 'year',
            rank: 'least200',
            score: 108,
        })
    }

    if (outputMonth == 1) {
        stat.push({
            type: 'output',
            timeline: 'month',
            rank: 'top1',
            score: 30,
        })
    } else if (outputMonth <= 5) {
        stat.push({
            type: 'output',
            timeline: 'month',
            rank: 'top5',
            score: 60,
        })
    } else if (outputMonth <= 10) {
        stat.push({
            type: 'output',
            timeline: 'month',
            rank: 'top10',
            score: 78,
        })
    } else if (outputMonth >= 25) {
        stat.push({
            type: 'output',
            timeline: 'month',
            rank: 'least25',
            score: 96,
        })
    } else if (outputMonth >= 20) {
        stat.push({
            type: 'output',
            timeline: 'month',
            rank: 'least20',
            score: 114,
        })
    }

    /* --- SUPPORT -- */

    if (supportDecade == 1) {
        stat.push({
            type: 'support',
            timeline: 'decade',
            rank: 'top1',
            score: 3,
            text: `วันเกิดนี้เป็นวันที่พลังสนับสนุนขึ้นสูงสุดในรอบ 10 ปี (ค.ศ. XXXX–XXXX) ซึ่งเป็นช่วงวันที่ไม่ค่อยเจอกันบ่อยนัก จึงมักได้รับการช่วยเหลือหรือการสนับสนุนมากกว่าปกติ
                แต่เพราะแรงสนับสนุนเยอะเกินไป อาจทำให้พึ่งพาคนอื่นง่าย หรือทำให้เคยชินกับการมีคนช่วย ควรฝึกจัดการเรื่องต่างๆ ด้วยตัวเองให้มากขึ้น`,
        })
    } else if (supportDecade <= 30) {
        stat.push({
            type: 'support',
            timeline: 'decade',
            rank: 'top30',
            score: 15,
            text: `วันเกิด XX/XX/XXXX อยู่ในกลุ่มวันที่พลังตัวตนสูงติด Top 30 ของ ค.ศ. XXXX-XXXX
                ทำให้ความเป็นตัวเองเด่นชัดขึ้น กล้าคิดกล้าตัดสินใจ
                แต่เพราะพลังตัวตนมาก อาจกลายเป็นดื้อ มองมุมเดียว หรือไม่ค่อยฟังคนอื่น ควรลดแรงปะทะและรับฟังเพิ่มขึ้น`,
        })
    } else if (supportDecade <= 150) {
        stat.push({
            type: 'support',
            timeline: 'decade',
            rank: 'top150',
            score: 33,
        })
    } else if (supportDecade <= 500) {
        stat.push({
            type: 'support',
            timeline: 'decade',
            rank: 'top500',
            score: 45,
        })
    } else if (supportDecade >= 3000) {
        stat.push({
            type: 'support',
            timeline: 'decade',
            rank: 'least3000',
            score: 63,
        })
    } else if (supportDecade >= 2500) {
        stat.push({
            type: 'support',
            timeline: 'decade',
            rank: 'least2500',
            score: 81,
        })
    } else if (supportDecade >= 2000) {
        stat.push({
            type: 'support',
            timeline: 'decade',
            rank: 'least2000',
            score: 99,
        })
    }

    if (supportYear == 1) {
        stat.push({
            type: 'support',
            timeline: 'year',
            rank: 'top1',
            score: 9,
        })
    } else if (supportYear <= 10) {
        stat.push({
            type: 'support',
            timeline: 'year',
            rank: 'top10',
            score: 21,
        })
    } else if (supportYear <= 25) {
        stat.push({
            type: 'support',
            timeline: 'year',
            rank: 'top25',
            score: 39,
        })
    } else if (supportYear <= 50) {
        stat.push({
            type: 'support',
            timeline: 'year',
            rank: 'top50',
            score: 51,
        })
    } else if (supportYear >= 300) {
        stat.push({
            type: 'support',
            timeline: 'year',
            rank: 'least300',
            score: 69,
        })
    } else if (supportYear >= 250) {
        stat.push({
            type: 'support',
            timeline: 'year',
            rank: 'least250',
            score: 87,
        })
    } else if (supportYear >= 200) {
        stat.push({
            type: 'support',
            timeline: 'year',
            rank: 'least200',
            score: 105,
        })
    }

    if (supportMonth == 1) {
        stat.push({
            type: 'support',
            timeline: 'month',
            rank: 'top1',
            score: 27,
        })
    } else if (supportMonth <= 5) {
        stat.push({
            type: 'support',
            timeline: 'month',
            rank: 'top5',
            score: 57,
        })
    } else if (supportMonth <= 10) {
        stat.push({
            type: 'support',
            timeline: 'month',
            rank: 'top10',
            score: 75,
        })
    } else if (supportMonth >= 25) {
        stat.push({
            type: 'support',
            timeline: 'month',
            rank: 'least25',
            score: 93,
        })
    } else if (supportMonth >= 20) {
        stat.push({
            type: 'support',
            timeline: 'month',
            rank: 'least20',
            score: 111,
        })
    }

    /* --- SELF -- */

    if (selfDecade == 1) {
        stat.push({
            type: 'self',
            timeline: 'decade',
            rank: 'top1',
            score: 2,
            text: `วันเกิดของคุณ XX/XX/XXXX เป็นวันที่พลังตัวตนขึ้นสูงที่สุดในรอบ 10 ปี (ค.ศ. XXXX–XXXX) เป็นวันที่ค่อนข้างหายาก ทำให้ความมั่นใจและความคิดของตัวเองเด่นชัดมาก แต่เพราะพลังล้น อาจกลายเป็นดื้อ เอาแต่ใจ หรือไม่ค่อยฟังคนอื่น ควรตั้งสติและเปิดใจรับมุมมองรอบข้างมากขึ้น`,
        })
    } else if (selfDecade <= 30) {
        stat.push({
            type: 'self',
            timeline: 'decade',
            rank: 'top30',
            score: 14,
            text: `วันเกิด XX/XX/XXXX อยู่ในกลุ่มวันที่พลังสนับสนุนสูงติด Top 30 ของค.ศ. XXXX-XXXX
                ชีวิตมักมีคนช่วย หรือได้โอกาสง่ายกว่าปกติ
                แต่เพราะมีแรงหนุนเยอะ อาจเผลอพึ่งคนอื่นมากไป หรือไม่ค่อยลงมือเอง ควรฝึกรับผิดชอบและทำด้วยตัวเองให้มากขึ้น`,
        })
    } else if (selfDecade <= 150) {
        stat.push({
            type: 'self',
            timeline: 'decade',
            rank: 'top150',
            score: 32,
        })
    } else if (selfDecade <= 500) {
        stat.push({
            type: 'self',
            timeline: 'decade',
            rank: 'top500',
            score: 44,
        })
    } else if (selfDecade >= 3000) {
        stat.push({
            type: 'self',
            timeline: 'decade',
            rank: 'least3000',
            score: 62,
        })
    } else if (selfDecade >= 2500) {
        stat.push({
            type: 'self',
            timeline: 'decade',
            rank: 'least2500',
            score: 80,
        })
    } else if (selfDecade >= 2000) {
        stat.push({
            type: 'self',
            timeline: 'decade',
            rank: 'least2000',
            score: 98,
        })
    }

    if (selfYear == 1) {
        stat.push({
            type: 'self',
            timeline: 'year',
            rank: 'top1',
            score: 8,
        })
    } else if (selfYear <= 10) {
        stat.push({
            type: 'self',
            timeline: 'year',
            rank: 'top10',
            score: 20,
        })
    } else if (selfYear <= 25) {
        stat.push({
            type: 'self',
            timeline: 'year',
            rank: 'top25',
            score: 38,
        })
    } else if (selfYear <= 50) {
        stat.push({
            type: 'self',
            timeline: 'year',
            rank: 'top50',
            score: 50,
        })
    } else if (selfYear >= 300) {
        stat.push({
            type: 'self',
            timeline: 'year',
            rank: 'least300',
            score: 68,
        })
    } else if (selfYear >= 250) {
        stat.push({
            type: 'self',
            timeline: 'year',
            rank: 'least250',
            score: 86,
        })
    } else if (selfYear >= 200) {
        stat.push({
            type: 'self',
            timeline: 'year',
            rank: 'least200',
            score: 104,
        })
    }

    if (selfMonth == 1) {
        stat.push({
            type: 'self',
            timeline: 'month',
            rank: 'top1',
            score: 26,
        })
    } else if (selfMonth <= 5) {
        stat.push({
            type: 'self',
            timeline: 'month',
            rank: 'top5',
            score: 56,
        })
    } else if (selfMonth <= 10) {
        stat.push({
            type: 'self',
            timeline: 'month',
            rank: 'top10',
            score: 74,
        })
    } else if (selfMonth >= 25) {
        stat.push({
            type: 'self',
            timeline: 'month',
            rank: 'least25',
            score: 92,
        })
    } else if (selfMonth >= 20) {
        stat.push({
            type: 'self',
            timeline: 'month',
            rank: 'least20',
            score: 110,
        })
    }

    /* --- BALANCE -- */

    if (balanceDecade == 1) {
        stat.push({
            type: 'balance',
            timeline: 'decade',
            rank: 'top1',
            score: 1,
            text: `วันเกิดที่พลังทั้ง 5 ธาตุสมดุล ไม่มีด้านใดล้นหรือขาด เหมาะกับการใช้ชีวิตแบบเรียบง่ายและมั่นคง พลังสมดุลที่สุดในรอบ 10 ปี ให้ความรู้สึกลงตัว ไม่สุดโต่ง`,
        })
    } else if (balanceDecade <= 30) {
        stat.push({
            type: 'balance',
            timeline: 'decade',
            rank: 'top30',
            score: 13,
            text: `วันเกิด XX/XX/XXXX อยู่ในกลุ่มวันที่พลังทั้งห้าด้านค่อนข้างสมดุลติด Top 30 ของค.ศ. XXXX-XXXX
                จึงไม่เด่นด้านใดเป็นพิเศษ แต่ภาพรวมค่อนข้างนิ่ง เรียบง่าย และปรับตัวได้ดี
                อย่างไรก็ตาม วันแบบนี้มักขาดแรงผลักดัน จึงควรกระตุ้นตัวเองให้มีเป้าหมายชัดขึ้น`,
        })
    } else if (balanceDecade <= 150) {
        stat.push({
            type: 'balance',
            timeline: 'decade',
            rank: 'top150',
            score: 31,
        })
    } else if (balanceDecade <= 500) {
        stat.push({
            type: 'balance',
            timeline: 'decade',
            rank: 'top500',
            score: 43,
        })
    } else if (balanceDecade >= 3000) {
        stat.push({
            type: 'balance',
            timeline: 'decade',
            rank: 'least3000',
            score: 61,
        })
    } else if (balanceDecade >= 2500) {
        stat.push({
            type: 'balance',
            timeline: 'decade',
            rank: 'least2500',
            score: 79,
        })
    } else if (balanceDecade >= 2000) {
        stat.push({
            type: 'balance',
            timeline: 'decade',
            rank: 'least2000',
            score: 97,
        })
    }

    if (balanceYear == 1) {
        stat.push({
            type: 'balance',
            timeline: 'year',
            rank: 'top1',
            score: 7,
        })
    } else if (balanceYear <= 10) {
        stat.push({
            type: 'balance',
            timeline: 'year',
            rank: 'top10',
            score: 19,
        })
    } else if (balanceYear <= 25) {
        stat.push({
            type: 'balance',
            timeline: 'year',
            rank: 'top25',
            score: 37,
        })
    } else if (balanceYear <= 50) {
        stat.push({
            type: 'balance',
            timeline: 'year',
            rank: 'top50',
            score: 49,
        })
    } else if (balanceYear >= 300) {
        stat.push({
            type: 'balance',
            timeline: 'year',
            rank: 'least300',
            score: 67,
        })
    } else if (balanceYear >= 250) {
        stat.push({
            type: 'balance',
            timeline: 'year',
            rank: 'least250',
            score: 85,
        })
    } else if (balanceYear >= 200) {
        stat.push({
            type: 'balance',
            timeline: 'year',
            rank: 'least200',
            score: 103,
        })
    }

    if (balanceMonth == 1) {
        stat.push({
            type: 'balance',
            timeline: 'month',
            rank: 'top1',
            score: 25,
        })
    } else if (balanceMonth <= 5) {
        stat.push({
            type: 'balance',
            timeline: 'month',
            rank: 'top5',
            score: 55,
        })
    } else if (balanceMonth <= 10) {
        stat.push({
            type: 'balance',
            timeline: 'month',
            rank: 'top10',
            score: 73,
        })
    } else if (balanceMonth >= 25) {
        stat.push({
            type: 'balance',
            timeline: 'month',
            rank: 'least25',
            score: 91,
        })
    } else if (balanceMonth >= 20) {
        stat.push({
            type: 'balance',
            timeline: 'month',
            rank: 'least20',
            score: 109,
        })
    }

    const info = {
        group: stat,
        score: {
            balanceDecade,
            balanceYear,
            balanceMonth,
            supportDecade,
            supportYear,
            supportMonth,
            selfDecade,
            selfYear,
            selfMonth,
            outputDecade,
            outputYear,
            outputMonth,
            wealthDecade,
            wealthYear,
            wealthMonth,
            controlDecade,
            controlYear,
            controlMonth,
        },
    }

    return info
}

export default {
    getPillars,
    getScore,
    getCountScoreYM,
    getDayMaster,
    getDayMasterStrength,
    tranformScore,
    addTranformScore,
    getLuckPillars,
    getFavoriteElement,
    findDanger,
    getRelationScore,
    getDirectionSuggest,
    findClash,
    findClash2,
    getPersonal,
    getDayMasterStrengthScore,
    getPersonalText,
    getFix,
    getAvoid,
    getStatRow,
    getStat,
}
