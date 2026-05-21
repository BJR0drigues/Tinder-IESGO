// ── Algoritmo de Match — Tinder IESGO ────────────────────────────
// Considera: curso, interesses, turno, intenção,
//            preferência de gênero, faixa etária e intenção

export interface MatchProfile {
  id:          string;
  course:      string | null;
  interests:   string[];   // já parseado do JSON
  shift:       string | null;
  intention:   string | null;
  gender:      string;
  dateOfBirth: Date;
  lookingFor:  string[];   // já parseado do JSON
  minAge:      number;
  maxAge:      number;
}

export interface CompatibilityResult {
  score: number;
  label: string;
}

// ── Grupos de cursos relacionados ─────────────────────────────────
const AGRO_GROUP    = ['Agronomia', 'Medicina Veterinária'];
const HEALTH_GROUP  = ['Biomedicina', 'Enfermagem', 'Farmácia', 'Fisioterapia', 'Medicina Veterinária'];
const BUSI_GROUP    = ['Administração', 'Ciências Contábeis'];
const TECH_GROUP    = ['Bacharelado em Sistema de Informação'];

function getAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

// ── Score base por combinação de cursos ───────────────────────────
function getCourseScore(c1: string, c2: string): { score: number; label: string } {
  if (c1 === c2) return { score: 85, label: `Dupla ${c1.split(' ')[0]}` };

  if (AGRO_GROUP.includes(c1) && AGRO_GROUP.includes(c2))
    return { score: 95, label: 'Casal Agro 🚜' };

  if (HEALTH_GROUP.includes(c1) && HEALTH_GROUP.includes(c2))
    return { score: 80, label: 'Plantão Juntos 🏥' };

  if ((c1 === 'Direito' && c2 === 'Psicologia') || (c2 === 'Direito' && c1 === 'Psicologia'))
    return { score: 92, label: 'Debate & Terapia 🧠⚖️' };

  if (TECH_GROUP.includes(c1) && TECH_GROUP.includes(c2))
    return { score: 88, label: 'Debugando o Amor 💻' };

  if (BUSI_GROUP.includes(c1) && BUSI_GROUP.includes(c2))
    return { score: 78, label: 'Sócios do Coração 📊' };

  return { score: 60, label: 'Opostos se Atraem' };
}

// ── Verificar preferência de gênero ──────────────────────────────
export function genderMatch(viewer: MatchProfile, candidate: MatchProfile): boolean {
  // Se não há preferência definida, mostra todos
  if (!viewer.lookingFor || viewer.lookingFor.length === 0) return true;

  const genderMap: Record<string, string[]> = {
    'Mulher':      ['Mulheres', 'Todos'],
    'Homem':       ['Homens',   'Todos'],
    'Não-binário': ['Pessoas não-binárias', 'Todos'],
  };

  const candidateGenderLabels = genderMap[candidate.gender] ?? ['Todos'];
  return viewer.lookingFor.some(pref =>
    candidateGenderLabels.includes(pref) || pref === 'Todos'
  );
}

// ── Verificar faixa de idade ──────────────────────────────────────
export function ageMatch(viewer: MatchProfile, candidate: MatchProfile): boolean {
  const candidateAge = getAge(candidate.dateOfBirth);
  return candidateAge >= viewer.minAge && candidateAge <= viewer.maxAge;
}

// ── Calcular compatibilidade ──────────────────────────────────────
export function calculateCompatibility(
  current: MatchProfile,
  target:  MatchProfile
): CompatibilityResult {
  if (!current.course || !target.course) {
    return { score: 65, label: 'Match Misterioso ✨' };
  }

  const { score: baseScore, label } = getCourseScore(current.course, target.course);

  // Bônus por interesses em comum (máx +10%)
  const commonInterests  = current.interests.filter(i => target.interests.includes(i));
  const interestBonus    = Math.min(commonInterests.length * 2, 10);

  // Bônus por mesmo turno (+5%)
  const shiftBonus       = current.shift && current.shift === target.shift ? 5 : 0;

  // Bônus por mesma intenção (+3%)
  const intentionBonus   = current.intention && current.intention === target.intention ? 3 : 0;

  const finalScore = Math.min(baseScore + interestBonus + shiftBonus + intentionBonus, 99);
  return { score: finalScore, label };
}

// ── Ordenar feed por relevância ───────────────────────────────────
export function sortFeedByCompatibility(
  current:    MatchProfile,
  candidates: MatchProfile[]
): Array<MatchProfile & { compatibility: CompatibilityResult }> {
  return candidates
    .filter(c => genderMatch(current, c) && ageMatch(current, c))
    .map(c => ({ ...c, compatibility: calculateCompatibility(current, c) }))
    .sort((a, b) => b.compatibility.score - a.compatibility.score);
}

