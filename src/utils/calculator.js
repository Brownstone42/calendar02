import { BaziCalculator } from '@aharris02/bazi-calculator-by-alvamind'
import { toDate } from 'date-fns-tz'

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

function getFix(favorite, score) {
    const filtered = Object.entries(score).filter(([el]) => favorite.includes(el))

    const [minElement] = filtered.reduce(
        (min, curr) => (curr[1] < min[1] ? curr : min),
        filtered[0],
    )

    const direction = DIRECTION_MAP2[minElement]
    const color = COLOR_MAP[minElement]

    const fix = {
        element: minElement,
        direction,
        color,
        text: '-',
    }

    return fix
}

function getAvoid(favorite, score) {
    const filtered = Object.entries(score).filter(([el]) => !favorite.includes(el))

    const [maxElement] = filtered.reduce(
        (max, curr) => (curr[1] > max[1] ? curr : max),
        filtered[0],
    )

    //const direction = Object.keys(DIRECTION_MAP).filter((key) => DIRECTION_MAP[key] === maxElement)
    const direction = DIRECTION_MAP2[maxElement]
    const color = COLOR_MAP[maxElement]

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
        if (dayMaster == 'Yang Earth') {
            text =
                'เปรียบเสมือนภูเขาสูงและแข็งแกร่งเกินไป มั่นคงแต่ปิดกั้นทุกอย่าง ดื้อ ดันทุรัง ไม่ฟังคำแนะนำ มักยึดมั่นในความเชื่อของตนจนยากปรับตัว ต้องเรียนรู้การเปิดใจและยอมรับการเปลี่ยนแปลง เพื่อไม่ให้กลายเป็น กำแพงที่โดดเดี่ยว'
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
        if (dayMaster == 'Yang Earth') {
            text =
                'เปรียบเสมือนภูเขาใหญ่ทรงพลัง มีอำนาจ มีวุฒิภาวะสูง รับผิดชอบได้ดี เป็นที่พึ่งของผู้อื่น แต่บางครั้งแบกรับมากเกินไปหรือไม่ยอมขอความช่วยเหลือ ต้องฝึกปล่อยบางส่วน เพื่อรักษาสมดุลพลัง'
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
        if (dayMaster == 'Yang Earth') {
            text =
                'เป็นคนมั่นคง มีศักดิ์ศรี ซื่อสัตย์ต่อหน้าที่และอุดมการณ์ เหมือนภูเขาที่ให้ร่มเงาแก่ผู้อื่น เหมาะกับตำแหน่งผู้นำหรือที่ต้องดูแลคนจำนวนมาก แต่ควรลดความดื้อและเปิดรับความคิดใหม่ๆ'
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
        if (dayMaster == 'Yang Earth') {
            text =
                'เปรียบเสมือนภูเขาที่มั่นคงแต่ยังมีน้ำซึมได้ หนักแน่น มีเหตุผล ไม่เร่งรีบเกินไป มีวินัยและจิตใจมั่นคง เหมาะกับงานที่ต้องการความอดทนและความรับผิดชอบ แต่ควรระวังความเฉื่อยหรือความช้าเกินไป'
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
        if (dayMaster == 'Yang Earth') {
            text =
                'เปรียบเสมือนภูเขาที่งดงามมั่นคงพอดี หนักแน่นแต่ยืดหยุ่น มีเหตุผลและเมตตา รู้จักรักษาคำพูดและรู้เวลาเปิดใจ มีทั้งความเชื่อมั่นและความเข้าใจ เหมาะกับบทบาทที่ต้องเป็นศูนย์กลางของทีม'
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
        if (dayMaster == 'Yang Earth') {
            text =
                'เปรียบเสมือนดินเริ่มสั่นไหว ยังมีความมั่นคงแต่ขาดความเชื่อมั่นในตัวเอง มักลังเลเวลาเผชิญแรงกดดัน ต้องการแรงสนับสนุนจากผู้อื่น ควรเสริมพลังด้วยกิจกรรมที่สร้างวินัยและความเชื่อในศักยภาพตนเอง'
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
        if (dayMaster == 'Yang Earth') {
            text =
                'เปรียบเสมือนภูเขาเริ่มพังทลายบางส่วน อ่อนไหวต่อคำพูดคนอื่น ขาดความมั่นใจในอุดมการณ์ อาจรู้สึกว่าถูกกลืนหรือไม่มีอิทธิพลในสังคม ต้องสร้างรากฐานในใจใหม่ เช่น การตั้งเป้าหมายเล็กๆ ที่ทำได้จริง'
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
        if (dayMaster == 'Yang Earth') {
            text =
                'เปรียบเสมือนดินแตกร้าว มักรับแรงกดดันไม่ได้ พึ่งพาคนรอบข้างมากไป รู้สึกหมดแรงใจหรือไร้ค่า ควรอยู่ใกล้คนที่ให้แรงบวก เพื่อกระตุ้นแรงผลักดันและโครงสร้างในชีวิต'
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
        if (dayMaster == 'Yang Earth') {
            text =
                'เปรียบเสมือนภูเขายุบลงเป็นพื้นราบ สูญเสียความมั่นคงทั้งภายนอกและภายใน ขาดทิศทาง ไม่กล้าตัดสินใจ รู้สึกไม่สามารถพึ่งตัวเองได้ ต้องเริ่มจากการวางรากฐานใหม่ ทั้งด้านจิตใจ ร่างกาย และสิ่งแวดล้อม เพื่อสร้างพลังคืนกลับ'
        }
    }

    return { dayMaster, dayMasterStrengthScore, text, strength }
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
}
