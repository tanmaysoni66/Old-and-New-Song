export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const defaultQuestionsByTest: Record<string, MCQQuestion[]> = {
  'mock_jee_phy_01': [
    {
      id: 'q1',
      question: 'A disc of mass M and radius R rolls without slipping on a horizontal surface. What fraction of its total kinetic energy is rotational?',
      options: ['1/2', '1/3', '2/3', '1/4'],
      correctIndex: 1,
      explanation: 'Total KE = Linear KE (1/2 M v^2) + Rotational KE (1/2 I w^2). For a solid disc, I = 1/2 M R^2. Thus K_rot = 1/4 M v^2 and K_total = 3/4 M v^2. Fraction = (1/4)/(3/4) = 1/3.'
    },
    {
      id: 'q2',
      question: 'Two particles of equal mass are revolving in circular paths of radii r1 and r2 with the same angular speed. The ratio of their centripetal forces is:',
      options: ['r1 / r2', 'r2 / r1', '(r1 / r2)^2', '1 : 1'],
      correctIndex: 0,
      explanation: 'Centripetal force F = m * omega^2 * r. Since m and omega are identical, F is directly proportional to r, so F1 / F2 = r1 / r2.'
    },
    {
      id: 'q3',
      question: 'Which of the following physical quantities has the dimensions [M^1 L^2 T^-1]?',
      options: ['Torque', 'Planck\'s constant', 'Gravitational potential', 'Power'],
      correctIndex: 1,
      explanation: 'Angular momentum and Planck\'s constant h have dimensions of [M L^2 T^-1]. Torque has [M L^2 T^-2].'
    },
    {
      id: 'q4',
      question: 'The electric field at a distance r from an infinitely long straight wire having linear charge density λ is proportional to:',
      options: ['1 / r^2', '1 / r', 'r', 'Constant'],
      correctIndex: 1,
      explanation: 'By Gauss\'s law, electric field E = λ / (2 * π * ε0 * r), which is proportional to 1/r.'
    },
    {
      id: 'q5',
      question: 'An ideal heat engine working between temperatures T1 (source) and T2 (sink) has an efficiency of:',
      options: ['1 - (T2/T1)', '1 - (T1/T2)', '(T1 - T2)/T2', 'T2/T1'],
      correctIndex: 0,
      explanation: 'Carnot efficiency η = 1 - (T_cold / T_hot) = 1 - (T2 / T1).'
    }
  ],
  'mock_neet_bio_01': [
    {
      id: 'bq1',
      question: 'Which cell organelle is known as the "Powerhouse of the cell"?',
      options: ['Golgi apparatus', 'Mitochondria', 'Endoplasmic reticulum', 'Lysosome'],
      correctIndex: 1,
      explanation: 'Mitochondria generate most of the chemical energy needed to power the cell\'s biochemical reactions via ATP production.'
    },
    {
      id: 'bq2',
      question: 'During which phase of meiosis does crossing over (genetic recombination) occur?',
      options: ['Leptotene', 'Zygotene', 'Pachytene', 'Diplotene'],
      correctIndex: 2,
      explanation: 'Crossing over between non-sister chromatids of homologous chromosomes occurs during the Pachytene stage of Prophase I, mediated by the recombinase enzyme.'
    },
    {
      id: 'bq3',
      question: 'Which of the following is NOT a polymer?',
      options: ['Proteins', 'Lipids', 'Polysaccharides', 'Nucleic acids'],
      correctIndex: 1,
      explanation: 'Lipids are macromolecules but not true polymers because they are not composed of repeating monomer units linked together like polysaccharides or proteins.'
    },
    {
      id: 'bq4',
      question: 'The term "fluid mosaic model" for plasma membrane was proposed by:',
      options: ['Singer and Nicolson', 'Robert Hooke', 'Watson and Crick', 'Camillo Golgi'],
      correctIndex: 0,
      explanation: 'S.J. Singer and G.L. Nicolson proposed the widely accepted Fluid Mosaic Model in 1972.'
    },
    {
      id: 'bq5',
      question: 'Which nitrogenous base is present in RNA but absent in DNA?',
      options: ['Thymine', 'Uracil', 'Cytosine', 'Guanine'],
      correctIndex: 1,
      explanation: 'Uracil is present in RNA in place of Thymine, which is found in DNA.'
    }
  ]
};
