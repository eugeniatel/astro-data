// src/data/interpretations.ts
// Static reference text for natal chart interpretations.
// Planet-in-sign, planet-in-house, and aspect meanings.
// Original text authored for this project.

// ---------------------------------------------------------------------------
// Planet in Sign
// ---------------------------------------------------------------------------
const PLANET_IN_SIGN: Record<string, string> = {
  // Sun
  'Sun-Aries': 'Identity rooted in initiative and self-assertion. Drawn to leadership and direct action. Thrives when blazing a trail.',
  'Sun-Taurus': 'Identity grounded in stability and sensory experience. Values security, patience, and tangible results. Builds slowly but enduringly.',
  'Sun-Gemini': 'Identity expressed through communication and curiosity. Needs mental stimulation and variety. Connects ideas across domains.',
  'Sun-Cancer': 'Identity centered on emotional security and nurturing. Deeply intuitive and protective. Home and family anchor the sense of self.',
  'Sun-Leo': 'Identity radiates through creative self-expression. Generous and warm, seeks recognition for authentic contributions. Natural performer.',
  'Sun-Virgo': 'Identity refined through analysis and service. Notices what others miss. Finds meaning in improving systems and helping others.',
  'Sun-Libra': 'Identity shaped by relationships and aesthetic harmony. Seeks balance and fairness. Diplomacy and partnership are core drives.',
  'Sun-Scorpio': 'Identity forged through intensity and transformation. Penetrates beneath surfaces. Power lies in emotional depth and resilience.',
  'Sun-Sagittarius': 'Identity expanded through exploration and meaning-making. Seeks truth, freedom, and broader horizons. Optimistic and philosophical.',
  'Sun-Capricorn': 'Identity built through discipline and long-term achievement. Respects structure and earned authority. Ambitious with quiet persistence.',
  'Sun-Aquarius': 'Identity expressed through originality and collective vision. Values independence and progressive ideals. Thinks systemically.',
  'Sun-Pisces': 'Identity dissolved into empathy and imagination. Boundaries between self and other blur. Creative, compassionate, spiritually attuned.',

  // Moon
  'Moon-Aries': 'Emotional needs met through action and independence. Processes feelings quickly and directly. Impatient with emotional complexity.',
  'Moon-Taurus': 'Emotional security through comfort and routine. Needs physical and material stability to feel safe. Slow to change but deeply loyal.',
  'Moon-Gemini': 'Emotional processing through talking and thinking. Needs mental engagement to feel settled. Feelings can shift rapidly.',
  'Moon-Cancer': 'Emotional nature at its most instinctive. Deep capacity for care and vulnerability. Mood follows inner tides closely.',
  'Moon-Leo': 'Emotional fulfillment through recognition and warmth. Needs to feel special and appreciated. Generous with affection.',
  'Moon-Virgo': 'Emotional comfort through order and usefulness. Processes feelings analytically. Shows care through practical acts of service.',
  'Moon-Libra': 'Emotional balance through harmony in relationships. Conflict is destabilizing. Needs aesthetic surroundings and companionship.',
  'Moon-Scorpio': 'Emotional intensity runs deep. Needs trust and emotional truth. Processes feelings through transformation, not suppression.',
  'Moon-Sagittarius': 'Emotional freedom through exploration and humor. Needs space and optimism. Processes feelings by finding meaning in them.',
  'Moon-Capricorn': 'Emotional reserve and self-discipline. Processes feelings privately. Finds security through achievement and responsibility.',
  'Moon-Aquarius': 'Emotional detachment serves clarity. Needs intellectual connection over emotional intensity. Cares about humanity broadly.',
  'Moon-Pisces': 'Emotional absorption of surrounding moods. Highly empathic and imaginative. Needs creative or spiritual outlets for feelings.',

  // Mercury
  'Mercury-Aries': 'Thinks fast and speaks directly. Quick to form opinions and share them. Communication style is assertive and competitive.',
  'Mercury-Taurus': 'Thinks deliberately and practically. Forms opinions slowly but holds them firmly. Communication is grounded and reliable.',
  'Mercury-Gemini': 'Mind moves rapidly between topics. Excellent communicator and natural learner. Curiosity drives constant information gathering.',
  'Mercury-Cancer': 'Thinks through feeling and memory. Communication is intuitive and protective. Remembers emotional details others forget.',
  'Mercury-Leo': 'Thinks dramatically and creatively. Communication carries warmth and authority. Enjoys storytelling and persuasion.',
  'Mercury-Virgo': 'Analytical precision in thought and speech. Notices details and inconsistencies. Communication is clear, specific, and helpful.',
  'Mercury-Libra': 'Thinks in terms of balance and fairness. Weighs all sides carefully. Communication is diplomatic and socially aware.',
  'Mercury-Scorpio': 'Thinks deeply and investigatively. Sees beneath surfaces and reads between lines. Communication is probing and strategic.',
  'Mercury-Sagittarius': 'Thinks broadly and philosophically. Drawn to big ideas and grand narratives. Communication is enthusiastic but can lack detail.',
  'Mercury-Capricorn': 'Thinks structurally and practically. Plans methodically. Communication is concise, authoritative, and goal-oriented.',
  'Mercury-Aquarius': 'Thinks unconventionally and systemically. Drawn to innovative ideas. Communication is original and intellectually independent.',
  'Mercury-Pisces': 'Thinks associatively and imaginatively. Communication is poetic and intuitive. May struggle with precision but excels at synthesis.',

  // Venus
  'Venus-Aries': 'Love is pursued boldly and directly. Attracted to confidence and initiative. Passion runs hot but can burn fast.',
  'Venus-Taurus': 'Love expressed through devotion and sensory pleasure. Values loyalty and beauty. Relationships are built to last.',
  'Venus-Gemini': 'Love needs intellectual connection and variety. Flirtatious and curious in romance. Values witty, stimulating partners.',
  'Venus-Cancer': 'Love expressed through nurturing and emotional bonding. Seeks security in relationships. Deeply sentimental and protective.',
  'Venus-Leo': 'Love expressed generously and dramatically. Needs admiration and romantic gestures. Loyal and warm in partnerships.',
  'Venus-Virgo': 'Love expressed through acts of service and practical care. Modest in affection. Values competence and reliability in partners.',
  'Venus-Libra': 'Love and partnership are central drives. Values harmony, beauty, and fairness in relationships. Natural romantic and diplomat.',
  'Venus-Scorpio': 'Love is all-or-nothing. Deep emotional and physical intensity in relationships. Values loyalty and fears betrayal.',
  'Venus-Sagittarius': 'Love needs freedom and adventure. Attracted to openness and philosophical depth. Resists emotional restriction.',
  'Venus-Capricorn': 'Love expressed through commitment and responsibility. Values stability and maturity in partners. Reserved but deeply devoted.',
  'Venus-Aquarius': 'Love needs space and intellectual connection. Values uniqueness and friendship in romance. Unconventional in affection.',
  'Venus-Pisces': 'Love is selfless and idealizing. Deep romantic imagination. Can sacrifice too much for partners. Seeks transcendent connection.',

  // Mars
  'Mars-Aries': 'Energy is direct, competitive, and fast. Acts on instinct. Conflict is met head-on. Physical drive is strong.',
  'Mars-Taurus': 'Energy is steady, persistent, and sensual. Slow to anger but immovable when provoked. Works patiently toward material goals.',
  'Mars-Gemini': 'Energy scattered across many interests. Fights with words and wit. Restless and mentally competitive.',
  'Mars-Cancer': 'Energy driven by emotional needs. Defensive rather than aggressive. Fights to protect home and loved ones.',
  'Mars-Leo': 'Energy expressed dramatically and confidently. Motivated by recognition and pride. Leadership through passionate action.',
  'Mars-Virgo': 'Energy channeled into precise, productive work. Fights for efficiency and correctness. Critical under stress.',
  'Mars-Libra': 'Energy directed toward fairness and balance. Indirect in conflict, preferring negotiation. Motivated by partnership.',
  'Mars-Scorpio': 'Energy is intense, strategic, and transformative. Fights with precision and emotional power. Determined and resourceful.',
  'Mars-Sagittarius': 'Energy is expansive, adventurous, and idealistic. Fights for beliefs and freedom. Physical activity needs variety.',
  'Mars-Capricorn': 'Energy is disciplined, ambitious, and goal-oriented. Works tirelessly toward achievement. Conflict is calculated.',
  'Mars-Aquarius': 'Energy directed toward reform and innovation. Fights for collective causes. Independent and unpredictable in action.',
  'Mars-Pisces': 'Energy is fluid and adaptable. Motivation comes from compassion and imagination. Avoids direct confrontation.',

  // Jupiter
  'Jupiter-Aries': 'Growth through initiative and courage. Luck favors bold action. Optimism fuels independent ventures.',
  'Jupiter-Taurus': 'Growth through accumulation and comfort. Expansion is steady and material. Generosity with resources.',
  'Jupiter-Gemini': 'Growth through learning and communication. Expansion of ideas and connections. Risk of spreading too thin.',
  'Jupiter-Cancer': 'Growth through nurturing and emotional generosity. Expansion of home and family. Deep instinct for care.',
  'Jupiter-Leo': 'Growth through creative self-expression and confidence. Expansion is dramatic and generous. Natural optimism.',
  'Jupiter-Virgo': 'Growth through service and practical improvement. Expansion is modest and detail-oriented. Generosity through helpfulness.',
  'Jupiter-Libra': 'Growth through partnerships and social grace. Expansion through relationships and diplomacy. Belief in fairness.',
  'Jupiter-Scorpio': 'Growth through depth and transformation. Expansion into hidden areas. Power of regeneration and resourcefulness.',
  'Jupiter-Sagittarius': 'Growth through exploration and philosophy. Natural expansiveness and optimism. Seeks meaning in all experiences.',
  'Jupiter-Capricorn': 'Growth through discipline and structure. Expansion is measured and responsible. Achievement through patience.',
  'Jupiter-Aquarius': 'Growth through innovation and collective ideals. Expansion of humanitarian vision. Progressive and original.',
  'Jupiter-Pisces': 'Growth through compassion and spiritual seeking. Expansion of imagination and empathy. Boundless generosity.',

  // Saturn
  'Saturn-Aries': 'Discipline applied to self-assertion. Lessons around independence and initiative. Must earn the right to lead.',
  'Saturn-Taurus': 'Discipline applied to material security. Lessons around value and self-worth. Must build stability through effort.',
  'Saturn-Gemini': 'Discipline applied to thinking and communication. Lessons around focus and intellectual rigor. Must earn credibility.',
  'Saturn-Cancer': 'Discipline applied to emotional expression. Lessons around vulnerability and nurturing. Must learn to need others.',
  'Saturn-Leo': 'Discipline applied to creative expression. Lessons around ego and recognition. Must earn authentic confidence.',
  'Saturn-Virgo': 'Discipline applied to service and analysis. Lessons around perfectionism and self-criticism. Must balance precision with compassion.',
  'Saturn-Libra': 'Discipline applied to relationships and fairness. Lessons around commitment and balance. Must earn trust through consistency.',
  'Saturn-Scorpio': 'Discipline applied to emotional intensity. Lessons around power, control, and transformation. Must face fears directly.',
  'Saturn-Sagittarius': 'Discipline applied to belief and exploration. Lessons around truth and overcommitment. Must ground ideals in reality.',
  'Saturn-Capricorn': 'Discipline is native and strong. Lessons around authority and ambition. Must avoid rigidity and emotional isolation.',
  'Saturn-Aquarius': 'Discipline applied to innovation and collective vision. Lessons around detachment and responsibility. Must balance reform with structure.',
  'Saturn-Pisces': 'Discipline applied to imagination and spirituality. Lessons around boundaries and escapism. Must ground compassion in action.',

  // Uranus, Neptune, Pluto (generational, shorter)
  'Uranus-Aries': 'Generational urge toward radical independence. Innovation through individual action.',
  'Uranus-Taurus': 'Generational disruption of material values. Innovation in finance and resources.',
  'Uranus-Gemini': 'Generational revolution in communication. Innovation through information and media.',
  'Uranus-Cancer': 'Generational changes in home and family structures. Innovation in domestic life.',
  'Uranus-Leo': 'Generational revolution in creative expression. Innovation through individuality.',
  'Uranus-Virgo': 'Generational changes in health and work. Innovation in technology and service.',
  'Uranus-Libra': 'Generational revolution in relationships. Innovation in partnership and social justice.',
  'Uranus-Scorpio': 'Generational transformation of power structures. Innovation through intensity.',
  'Uranus-Sagittarius': 'Generational revolution in belief systems. Innovation through exploration.',
  'Uranus-Capricorn': 'Generational restructuring of institutions. Innovation within existing systems.',
  'Uranus-Aquarius': 'Generational revolution at its peak. Innovation through collective consciousness.',
  'Uranus-Pisces': 'Generational dissolution of boundaries. Innovation through spirituality and imagination.',
  'Neptune-Aries': 'Generational idealism about independence and action.',
  'Neptune-Taurus': 'Generational dreams around material and natural beauty.',
  'Neptune-Gemini': 'Generational idealism in communication and ideas.',
  'Neptune-Cancer': 'Generational nostalgia and idealization of home.',
  'Neptune-Leo': 'Generational idealism in creativity and entertainment.',
  'Neptune-Virgo': 'Generational idealism in health and service.',
  'Neptune-Libra': 'Generational idealism in love and social harmony.',
  'Neptune-Scorpio': 'Generational fascination with hidden realities and transformation.',
  'Neptune-Sagittarius': 'Generational spiritual seeking and idealistic exploration.',
  'Neptune-Capricorn': 'Generational disillusionment with institutions and authority.',
  'Neptune-Aquarius': 'Generational idealism about technology and collective progress.',
  'Neptune-Pisces': 'Generational peak of spiritual, imaginative, and empathic energy.',
  'Pluto-Aries': 'Generational transformation through assertive power.',
  'Pluto-Taurus': 'Generational transformation of economic systems and values.',
  'Pluto-Gemini': 'Generational transformation of communication and information.',
  'Pluto-Cancer': 'Generational transformation of family and national identity.',
  'Pluto-Leo': 'Generational transformation through creative power and leadership.',
  'Pluto-Virgo': 'Generational transformation of work, health, and daily systems.',
  'Pluto-Libra': 'Generational transformation of relationships and justice.',
  'Pluto-Scorpio': 'Generational transformation at its deepest. Power, death, rebirth themes.',
  'Pluto-Sagittarius': 'Generational transformation of belief systems and global awareness.',
  'Pluto-Capricorn': 'Generational transformation of power structures and governance.',
  'Pluto-Aquarius': 'Generational transformation of collective systems and technology.',
  'Pluto-Pisces': 'Generational transformation through spiritual awakening and dissolution.',
};

// ---------------------------------------------------------------------------
// Planet in House
// ---------------------------------------------------------------------------
const PLANET_IN_HOUSE: Record<string, string> = {
  'Sun-1': 'Strong sense of self and personal identity. Others notice you immediately. Life is shaped by self-expression.',
  'Sun-2': 'Identity tied to resources and self-worth. Financial security matters deeply. Values shape how you present yourself.',
  'Sun-3': 'Identity expressed through communication and learning. Siblings and neighbors play key roles. Curious and articulate.',
  'Sun-4': 'Identity rooted in home and family origins. Private by nature. Finding your roots is a lifelong theme.',
  'Sun-5': 'Identity shines through creativity and pleasure. Romance, children, and play are central. Natural performer.',
  'Sun-6': 'Identity refined through daily routines and service. Health and work habits define you. Finds purpose in being useful.',
  'Sun-7': 'Identity discovered through partnerships. Others mirror your qualities. Marriage and close bonds are central.',
  'Sun-8': 'Identity transformed through crisis and shared resources. Power dynamics and intimacy are growth areas.',
  'Sun-9': 'Identity expanded through travel, education, and philosophy. Seeks meaning beyond the immediate. Teacher or explorer.',
  'Sun-10': 'Identity expressed through career and public reputation. Ambition and achievement are core drives. Visible in the world.',
  'Sun-11': 'Identity found within groups and collective vision. Friendships and social causes define purpose.',
  'Sun-12': 'Identity operates behind the scenes. Rich inner life. Needs solitude. Spiritual or creative withdrawal is restorative.',
  'Moon-1': 'Emotions are visible and shape first impressions. Mood affects appearance. Responsive and instinctive.',
  'Moon-2': 'Emotional security tied to finances and possessions. Comfort through material stability.',
  'Moon-3': 'Emotional processing through conversation and writing. Feelings fluctuate with daily interactions.',
  'Moon-4': 'Emotional roots run deep. Home is the emotional center. Strong connection to family of origin.',
  'Moon-5': 'Emotional fulfillment through creativity and romance. Playful and expressive with feelings.',
  'Moon-6': 'Emotional stability through routine and health habits. Shows care through service and practical support.',
  'Moon-7': 'Emotional needs met through partnership. Seeks emotional security in close relationships.',
  'Moon-8': 'Emotional intensity and transformative experiences. Processes feelings at deep, sometimes hidden levels.',
  'Moon-9': 'Emotional growth through exploration and learning. Feelings are tied to beliefs and meaning.',
  'Moon-10': 'Emotional needs connected to public image and career. Mother figure may be prominent or ambitious.',
  'Moon-11': 'Emotional fulfillment through friendships and community. Needs to belong to something larger.',
  'Moon-12': 'Emotions are private and sometimes hidden. Rich inner life. Needs time alone to process feelings.',
  'Mercury-1': 'Communication defines your presence. Quick-thinking and articulate. Others see you as intellectual.',
  'Mercury-2': 'Mental energy focused on money and resources. Business-minded and practical in communication.',
  'Mercury-3': 'Mercury is at home here. Excellent communicator, learner, and networker. Busy mind and schedule.',
  'Mercury-4': 'Thinking shaped by family background. Memories are important. May work from home.',
  'Mercury-5': 'Creative and playful communication. Enjoys games, puzzles, and storytelling. Teaching comes naturally.',
  'Mercury-6': 'Analytical mind focused on work and health. Detail-oriented in daily tasks. Efficient communicator.',
  'Mercury-7': 'Communication centered on relationships. Negotiation and diplomacy come naturally. Thinks in pairs.',
  'Mercury-8': 'Investigative and probing mind. Drawn to research, psychology, and hidden knowledge.',
  'Mercury-9': 'Mind oriented toward big ideas, philosophy, and travel. Broad thinker. May publish or teach.',
  'Mercury-10': 'Communication skills serve career ambitions. Public speaking or writing may be part of profession.',
  'Mercury-11': 'Intellectual engagement with groups and causes. Network of ideas and like-minded thinkers.',
  'Mercury-12': 'Thinking happens in private. Rich inner dialogue. Creative or spiritual mental life.',
  'Venus-1': 'Charm and attractiveness are immediately apparent. Values beauty and harmony in self-presentation.',
  'Venus-2': 'Pleasure in material comforts and financial security. Attracts resources. Values quality.',
  'Venus-3': 'Social and communicative. Enjoys learning and sharing. Harmonious relationships with siblings.',
  'Venus-4': 'Love of home and family. Beautiful domestic environment matters. Harmonious family roots.',
  'Venus-5': 'Romance, creativity, and pleasure are central. Attracts love naturally. Enjoys art and entertainment.',
  'Venus-6': 'Finds beauty in service and daily routines. Harmonious work environment matters. Health-conscious.',
  'Venus-7': 'Partnership is a primary value. Marriage and committed relationships are central to happiness.',
  'Venus-8': 'Intense and transformative love experiences. Drawn to deep emotional and financial bonds.',
  'Venus-9': 'Love of travel, learning, and cultural diversity. Attracted to foreign or philosophical partners.',
  'Venus-10': 'Career benefits from charm and social skills. Public image is polished and appealing.',
  'Venus-11': 'Social life is rich and fulfilling. Values friendship highly. Attracted to group causes.',
  'Venus-12': 'Love is private and idealistic. May have hidden relationships. Compassionate and selfless in love.',
  'Mars-1': 'High energy and assertiveness. Physically active and competitive. Others see you as bold.',
  'Mars-2': 'Drive directed toward earning and accumulating resources. Fights for financial security.',
  'Mars-3': 'Assertive communication. Debates and argues readily. Active mind and busy local life.',
  'Mars-4': 'Energy invested in home and family. May clash with family members. Protective of domestic space.',
  'Mars-5': 'Passionate about creativity, romance, and competition. High energy in play and self-expression.',
  'Mars-6': 'Hard worker with high energy for daily tasks. Driven in health and work routines.',
  'Mars-7': 'Attracted to assertive partners. Relationships are passionate but can be competitive.',
  'Mars-8': 'Intense drive around shared resources and power. Transformative experiences through conflict.',
  'Mars-9': 'Action driven by beliefs and ideals. Fights for truth. Adventurous and physically bold.',
  'Mars-10': 'Career ambition is strong. Professional drive and competitive edge in public life.',
  'Mars-11': 'Energy directed toward group goals and social causes. Active in communities and organizations.',
  'Mars-12': 'Energy operates behind the scenes. Action may be hidden or unconscious. Needs solitary outlets.',
  'Jupiter-1': 'Naturally optimistic and expansive presence. Luck favors personal initiatives. Generous spirit.',
  'Jupiter-2': 'Financial luck and material generosity. Resources tend to grow. Values abundance.',
  'Jupiter-3': 'Growth through learning and communication. Broad intellectual interests. Lucky in local connections.',
  'Jupiter-4': 'Growth centered on home and family. Large or generous domestic life. Strong roots.',
  'Jupiter-5': 'Luck in creative and romantic pursuits. Generous with children. Joyful self-expression.',
  'Jupiter-6': 'Growth through work and service. Fortunate in health and daily routines. Helpful nature.',
  'Jupiter-7': 'Growth through partnerships. Lucky in marriage and close bonds. Generous with partners.',
  'Jupiter-8': 'Growth through shared resources and transformation. Benefits from others\' generosity.',
  'Jupiter-9': 'Jupiter is at home here. Travel, education, and philosophy expand life greatly.',
  'Jupiter-10': 'Career expansion and public recognition. Lucky in professional pursuits. Natural authority.',
  'Jupiter-11': 'Growth through groups and collective vision. Wide social circle. Humanitarian ideals.',
  'Jupiter-12': 'Inner growth and spiritual expansion. Luck operates behind the scenes. Generous in private.',
  'Saturn-1': 'Serious and responsible demeanor. Self-discipline shapes identity. Maturity comes early.',
  'Saturn-2': 'Financial caution and responsibility. Security is earned through effort. Values are tested.',
  'Saturn-3': 'Careful and structured communication. Learning requires discipline. Relationships with siblings may be tested.',
  'Saturn-4': 'Responsibility centered on home and family. May carry family burdens. Builds security slowly.',
  'Saturn-5': 'Creativity requires discipline. Romance is serious. May take time to learn to play.',
  'Saturn-6': 'Disciplined worker. Health requires attention. Daily routines are structured and productive.',
  'Saturn-7': 'Serious about partnerships. Commitment is deep but may come late. Lessons through relationships.',
  'Saturn-8': 'Control issues around shared resources and intimacy. Transformation through facing fears.',
  'Saturn-9': 'Structured approach to beliefs and education. Travel may be restricted or purposeful.',
  'Saturn-10': 'Saturn is strong here. Career ambition is disciplined and enduring. Authority earned over time.',
  'Saturn-11': 'Responsibility within groups. Friendships are few but lasting. Social ideals require work.',
  'Saturn-12': 'Lessons in solitude and surrender. Hidden fears must be faced. Growth through inner work.',
  'Uranus-1': 'Unconventional presence and identity. Others see you as unique or eccentric.',
  'Uranus-2': 'Unpredictable finances. Innovative approach to resources and values.',
  'Uranus-3': 'Original thinking and unconventional communication. Sudden changes in local environment.',
  'Uranus-4': 'Disruptions in home life. Unconventional family background or domestic arrangements.',
  'Uranus-5': 'Innovative creativity. Unconventional romance. Children may be unusual.',
  'Uranus-6': 'Innovation in work and health routines. Unconventional daily habits.',
  'Uranus-7': 'Unconventional partnerships. Sudden changes in relationships. Need for independence in bonds.',
  'Uranus-8': 'Sudden transformations. Unconventional approach to shared resources and intimacy.',
  'Uranus-9': 'Revolutionary beliefs. Unconventional education or travel. Original philosophical views.',
  'Uranus-10': 'Unconventional career path. Sudden changes in public status. Innovative professional life.',
  'Uranus-11': 'Innovative within groups. Attracts unusual friendships. Ahead of social trends.',
  'Uranus-12': 'Sudden spiritual insights. Unconventional inner life. Liberation through solitude.',
  'Neptune-1': 'Dreamy and elusive presence. Others may project onto you. Sensitive to environment.',
  'Neptune-2': 'Idealistic about money and values. Finances may be unclear. Generous or impractical.',
  'Neptune-3': 'Imaginative communication. Intuitive learning. May struggle with practical details.',
  'Neptune-4': 'Idealized or unclear family origins. Home is a place of retreat and imagination.',
  'Neptune-5': 'Highly creative and romantic. Art and fantasy are central. Idealized love affairs.',
  'Neptune-6': 'Service-oriented with compassion. Health may be sensitive. Work involves helping others.',
  'Neptune-7': 'Idealized partnerships. May attract unclear or deceptive relationships. Seeks soulmate.',
  'Neptune-8': 'Dissolution through intimacy and shared resources. Psychic sensitivity. Deep emotional merging.',
  'Neptune-9': 'Spiritual seeking and visionary beliefs. Drawn to transcendent experiences. Inspired traveler.',
  'Neptune-10': 'Idealized public image. Career in creative or helping fields. Public perception is fluid.',
  'Neptune-11': 'Idealistic about friendships and causes. Spiritual community connections.',
  'Neptune-12': 'Neptune is at home here. Rich inner life. Spiritual depth. Needs healthy boundaries.',
  'Pluto-1': 'Intense and transformative presence. Others feel your power. Life involves reinvention.',
  'Pluto-2': 'Transformative relationship with money and self-worth. Power through resources.',
  'Pluto-3': 'Penetrating mind and powerful communication. Transformative learning experiences.',
  'Pluto-4': 'Deep transformation through family and roots. Home life involves power dynamics.',
  'Pluto-5': 'Intense creativity and passionate romance. Transformative experiences through children.',
  'Pluto-6': 'Transformation through work and health crises. Powerful daily routines.',
  'Pluto-7': 'Transformative partnerships. Power dynamics in close relationships. Deep bonds.',
  'Pluto-8': 'Pluto is at home here. Deep transformation, shared resources, and regeneration.',
  'Pluto-9': 'Transformation of beliefs. Powerful spiritual or philosophical journey.',
  'Pluto-10': 'Transformative career and public influence. Power in professional life.',
  'Pluto-11': 'Transformation through groups and collective action. Power within organizations.',
  'Pluto-12': 'Deep unconscious transformation. Hidden power. Profound inner life.',
};

// ---------------------------------------------------------------------------
// Aspects
// ---------------------------------------------------------------------------
const ASPECT_TEXTS: Record<string, string> = {
  conjunction: 'Energies are fused and amplified. These planets operate as one force, blending their qualities for better or worse.',
  sextile: 'Harmonious opportunity. These planets support each other with ease, creating natural talents that flow when engaged.',
  square: 'Dynamic tension that demands action. These planets challenge each other, creating friction that drives growth through effort.',
  trine: 'Effortless harmony. These planets flow together naturally, creating innate gifts and areas of ease.',
  quincunx: 'Awkward adjustment needed. These planets operate on incompatible wavelengths, requiring constant recalibration.',
  opposition: 'Polarized awareness. These planets face each other across the chart, creating tension that seeks integration and balance.',
};

// ---------------------------------------------------------------------------
// Transit interpretations (100 planet-pair entries + aspect modifiers)
// ---------------------------------------------------------------------------

// Each entry: what specifically happens when this transit planet contacts this natal planet.
// Aspect type adds a modifier at the end (how the energy arrives).
const TRANSIT_PAIRS: Record<string, string> = {
  // --- Pluto transits (2-3 years per aspect, life-altering) ---
  'Pluto-Sun': 'A defining period that can last years. Pluto strips away the parts of your identity that are performative or inherited rather than chosen. You may face power struggles, health crises, or complete career pivots. Who you are on the other side of this transit will not resemble who you were going in.',
  'Pluto-Moon': 'Your emotional foundations are being excavated. Relationships with maternal figures or your own nurturing instincts undergo deep change. Suppressed feelings surface with force. Therapy, shadow work, or simply sitting with discomfort becomes necessary. Home and family life may transform entirely.',
  'Pluto-Mercury': 'Your mind becomes obsessive, penetrating, and suspicious of surfaces. You may become fascinated with psychology, research, or hidden information. Communication can become manipulative if unconscious. Writing, investigating, or studying taboo subjects channels this well.',
  'Pluto-Venus': 'Relationships become intense, possessive, or transformative. You may encounter a person who changes your entire value system, or an existing relationship undergoes a death-and-rebirth cycle. Jealousy, desire, and questions about what you truly want in love come to the surface.',
  'Pluto-Mars': 'Your willpower and aggression are supercharged. This can manifest as relentless ambition, rage that surprises you, or physical confrontations. Channel this into demanding physical work, competitive pursuits, or tearing down something that needs rebuilding. Power struggles with men or authority figures are common.',
  'Pluto-Jupiter': 'Ambition and vision expand dramatically. You may gain significant wealth, influence, or status, but the methods matter. Corruption tempts. Legal, religious, or philosophical conflicts can escalate. At best, you become a force for deep, principled change in your field.',
  'Pluto-Saturn': 'The structures you have built are stress-tested to destruction. Career, reputation, and long-term commitments either prove their worth or collapse. This is one of the hardest transits: slow, grinding, and unavoidable. What survives this period is genuinely solid.',
  'Pluto-Uranus': 'A generational transit. Revolutionary impulses intensify. Technology, politics, or social movements may disrupt your life in ways you cannot control. Personal freedom and collective power dynamics collide. Stay flexible; rigidity breaks under this pressure.',
  'Pluto-Neptune': 'A generational transit affecting your relationship to spirituality, imagination, and collective illusions. Belief systems dissolve and reform. Artistic or spiritual experiences can be profoundly transformative. Watch for deception at scale.',
  'Pluto-Pluto': 'A generational milestone (square in your 30s-40s, trine later). You confront the power dynamics embedded in your generation. Personal empowerment through accepting mortality, loss, or the limits of control. Deep psychological growth.',

  // --- Neptune transits (1-2 years per aspect, dissolving and confusing) ---
  'Neptune-Sun': 'Your sense of self becomes porous. You may feel lost, inspired, or both. Creative and spiritual life flourishes, but practical matters suffer from lack of clarity. Others may project fantasies onto you. Identity fraud or health misdiagnoses are possible. Trust your intuition but verify facts.',
  'Neptune-Moon': 'Emotional sensitivity reaches extraordinary levels. You absorb the moods of everyone around you. Dreams are vivid and sometimes prophetic. Boundaries with family members blur. Addiction risks increase as you seek escape from overwhelming feelings. Music, water, and solitude heal.',
  'Neptune-Mercury': 'Clear thinking becomes difficult. You may misread messages, sign confusing contracts, or forget important details. But your imagination and poetic sensibility peak. Writing fiction, learning music, or studying spiritual traditions channels this beautifully. Avoid major business decisions.',
  'Neptune-Venus': 'Romance becomes idealized and otherworldly. You may fall for someone unavailable, imaginary, or deceptive. Existing relationships either transcend to a new level of compassion or reveal painful truths you had been ignoring. Art and beauty become necessary rather than optional.',
  'Neptune-Mars': 'Your drive and aggression dissolve. Actions feel pointless or directionless. Physical energy is low. Passive-aggressive tendencies increase. Channel this into dance, swimming, martial arts with a spiritual component, or any action motivated by compassion rather than ego.',
  'Neptune-Jupiter': 'Idealism and faith expand, sometimes dangerously. You may take on charitable causes, spiritual quests, or educational pursuits with boundless optimism. The risk is overextension and gullibility. Not every guru, investment, or "sure thing" is what it claims.',
  'Neptune-Saturn': 'Your carefully built structures face an erosion test. Responsibilities feel meaningless or overwhelming. Career goals may shift from material to spiritual. This transit asks: are your ambitions genuinely yours, or are they someone else\'s expectations? Disillusionment serves a purpose.',
  'Neptune-Uranus': 'A generational transit. The boundary between technology and mysticism blurs. Innovation takes spiritual or artistic forms. Collective visions of the future shift. Personally, your need for freedom may express through spiritual or creative channels.',
  'Neptune-Neptune': 'A Neptune square (around age 41) or other major Neptune cycle. Your entire relationship to meaning, faith, and imagination is restructured. Midlife spiritual crises belong here. What you believed at 20 no longer sustains you. Something more honest must replace it.',
  'Neptune-Pluto': 'A generational transit. Deep collective unconscious material surfaces through culture, art, and politics. Personally, your relationship to power and transformation takes on a mystical quality. Hidden motivations become visible through dreams or synchronicities.',

  // --- Uranus transits (1 year per aspect, sudden and liberating) ---
  'Uranus-Sun': 'Your identity is being rewired from the inside out. Sudden changes in career, appearance, or life direction feel both thrilling and destabilizing. You may leave a marriage, quit a career, or reinvent yourself in ways that shock people who thought they knew you. The key is not to resist the authentic impulse.',
  'Uranus-Moon': 'Emotional life becomes unpredictable. Your needs change suddenly: what felt safe now feels suffocating. Moves, domestic upheavals, or shifts in family dynamics happen without warning. Women in your life may act erratically. Freedom becomes an emotional rather than intellectual priority.',
  'Uranus-Mercury': 'Your thinking accelerates and becomes unconventional. Breakthrough ideas arrive suddenly. You may become interested in technology, astrology, or radical viewpoints. Communication style changes. Nervous system is overstimulated; insomnia and anxiety are possible. Write down the insights that come at 3am.',
  'Uranus-Venus': 'Relationships are electrified. You may fall for someone completely unlike your usual type, or an existing relationship either evolves dramatically or ends abruptly. Your aesthetic tastes change. Financial surprises (positive or negative) are possible. Boredom in love becomes intolerable.',
  'Uranus-Mars': 'Impulsive energy spikes. Accidents are more likely when you act without thinking. But calculated risks pay off unusually well. Your physical routine needs radical change. Competitive drive is erratic: brilliant one day, completely absent the next. Avoid unnecessary confrontations.',
  'Uranus-Jupiter': 'Opportunities appear from nowhere and disappear just as fast. Travel, education, and belief systems undergo rapid expansion. You may receive sudden lucky breaks or take gambles that pay off. Restlessness with conventional paths peaks. Entrepreneurial energy is strong.',
  'Uranus-Saturn': 'Tension between stability and freedom reaches a breaking point. The structures in your life (career, marriage, routines) are tested by sudden events. What is rigid cracks. What is flexible adapts. This transit forces necessary modernization of outdated commitments.',
  'Uranus-Uranus': 'A Uranus cycle transit (opposition around age 42, return at 84). At the opposition, you confront whether your life reflects your authentic self or a compromise you made decades ago. Midlife rebellion is the cliche; midlife liberation is the goal.',
  'Uranus-Neptune': 'A generational transit. The collective imagination is disrupted. Technology and spirituality merge in unexpected ways. Personally, your ideals and dreams undergo sudden revision. What inspired you before may suddenly seem naive, replaced by a sharper vision.',
  'Uranus-Pluto': 'A generational transit with personal power. Revolutionary energy meets transformative force. You may become involved in movements for radical change, or experience sudden power shifts in your personal life. Control is an illusion during this transit; adaptability is survival.',

  // --- Saturn transits (6-9 months per aspect, testing and maturing) ---
  'Saturn-Sun': 'A reality check on your entire life direction. Energy is lower than usual. Achievements require more effort for less recognition. Authority figures scrutinize your work. But the discipline you build now creates lasting success. This is the transit of earning what you get.',
  'Saturn-Moon': 'Emotional life feels heavy, restricted, or lonely. Relationships with women or family members are tested. You may take on caregiving responsibilities. Depression is possible if you suppress feelings. The work is to build emotional resilience without becoming cold.',
  'Saturn-Mercury': 'Thinking becomes serious, methodical, and pessimistic. Communication is measured; you say less but mean more. Good for studying, writing non-fiction, or organizing information. Bad for spontaneous creativity. Mental burdens feel heavy. Structure your learning.',
  'Saturn-Venus': 'Relationships are tested for durability. Superficial connections fall away. You may feel unloved, unattractive, or financially constrained. But partnerships that survive this transit are genuinely committed. New relationships that begin now tend to be serious from the start.',
  'Saturn-Mars': 'Your energy and initiative are frustrated by obstacles, delays, or authority. Anger simmers but cannot find release. Physical effort produces slow results. Patience with physical limitations is required. Disciplined training (not just raw effort) is the key.',
  'Saturn-Jupiter': 'Expansion meets restriction. Growth plans are delayed, scaled back, or forced to become practical. Optimism gives way to realism. Business plans that survive Saturn-Jupiter are the ones worth pursuing. This transit separates genuine opportunity from wishful thinking.',
  'Saturn-Saturn': 'The Saturn return (ages 28-30, 57-59) or other Saturn cycle. Your entire life structure is audited. Career, relationships, and commitments that do not serve your actual path are dismantled. This is one of the most important transits in a lifetime. What you build in its wake defines your next chapter.',
  'Saturn-Uranus': 'Freedom and responsibility collide. You want to break free, but obligations hold you. Or external disruptions threaten your stability. The resolution is finding a way to innovate within structure, not abandoning responsibility or suppressing your need for change.',
  'Saturn-Neptune': 'Your ideals are reality-tested. Dreams that cannot survive practical scrutiny dissolve. This feels like disillusionment but is actually clarification. Spiritual practices that include discipline (meditation, fasting, study) thrive. Escapism is punished.',
  'Saturn-Pluto': 'One of the most demanding transits. Power structures in your life are tested to their limits. You may face institutional opposition, profound loss, or situations where endurance is the only option. What you refuse to let break becomes your greatest source of authority.',

  // --- Jupiter transits (1-2 months per aspect, expanding and optimistic) ---
  'Jupiter-Sun': 'Confidence, vitality, and opportunity peak. Doors open that align with who you actually are. Good for launching projects, seeking promotion, or expanding your public role. The risk is overconfidence and overcommitment. Say yes to the right things, not everything.',
  'Jupiter-Moon': 'Emotional generosity and domestic expansion. You may move to a larger home, welcome someone into your family, or feel unusually content. Relationships with women are supportive. Comfort-seeking increases: watch for weight gain or overindulgence as emotional soothing.',
  'Jupiter-Mercury': 'Thinking goes big. Travel, education, publishing, and communication projects flourish. Your ideas reach a wider audience. Contracts and negotiations favor you. The risk is promising more than you can deliver or spreading your attention too thin.',
  'Jupiter-Venus': 'Love and money flow more easily. New relationships begun now tend to be beneficial. Social life expands. Art, beauty, and pleasure are emphasized. Financial gains are possible through partnerships. The risk is extravagance and taking good fortune for granted.',
  'Jupiter-Mars': 'Energy, confidence, and competitive drive surge. Physical activities go well. Business initiatives, athletic pursuits, and assertive moves are favored. Courage is rewarded. The risk is recklessness, arrogance, or overestimating your physical capacity.',
  'Jupiter-Jupiter': 'A Jupiter return (every 12 years). Your belief system, sense of meaning, and growth trajectory reset. The vision you form now guides the next 12-year cycle. Travel, education, and philosophical exploration are highlighted. Ask: what do I actually believe?',
  'Jupiter-Saturn': 'A productive period where expansion and discipline find balance. Long-term plans advance concretely. Business growth is sustainable rather than speculative. Authority figures support your ambitions. Building something that lasts is the theme.',
  'Jupiter-Uranus': 'Sudden opportunities and lucky breaks. Your need for freedom and growth align unexpectedly. Travel, technology, and unconventional paths are favored. Breakthroughs in understanding arrive as flashes of insight. Act on good ideas quickly; the window is brief.',
  'Jupiter-Neptune': 'Imagination, spirituality, and creative vision expand enormously. Compassion deepens. Charitable impulses are strong. But discernment weakens: not every vision is viable, and not every cause deserves your resources. Inspired but not delusional is the target.',
  'Jupiter-Pluto': 'Ambition and power expand. You may gain significant influence, wealth, or status. Research, investment, and strategic moves are favored. The ethical dimension matters: power gained through integrity compounds; power gained through manipulation collapses later.',

  // --- Mars transits (3-5 days per aspect, energizing and activating) ---
  'Mars-Sun': 'A burst of vitality and assertiveness lasting a few days. Good for starting projects, having difficult conversations, or physical competition. Ego conflicts are possible. You feel more alive but also more combative. Channel the energy before it channels itself.',
  'Mars-Moon': 'Emotions become sharp, reactive, and physical. You feel things in your body: gut reactions, tension, restless energy. Arguments with family or women are possible. Domestic projects benefit from the energy. Cook, clean, exercise, or do something physical with your feelings.',
  'Mars-Mercury': 'Thinking accelerates and becomes argumentative. Debates are stimulating but can escalate. Good for focused mental work, writing with urgency, or solving problems that require sharp thinking. Bad for diplomacy. Words cut deeper than intended.',
  'Mars-Venus': 'Desire, attraction, and social energy spike. Good for dates, creative projects, and anything requiring charm with edge. Spending impulses are strong. Sexual energy is high. Existing relationships get a spark of passion or friction, depending on their health.',
  'Mars-Mars': 'A Mars return (every 2 years). Your physical energy, drive, and anger reset. The way you assert yourself is recalibrated. New physical routines, competitive goals, or assertiveness patterns begin. A good time to start training programs or confrontational projects.',
  'Mars-Jupiter': 'Enthusiasm and physical energy combine. Bold moves are favored. Travel, sports, and entrepreneurial action go well. You feel invincible, which is mostly accurate but watch for overreach. Generosity with your energy is rewarded.',
  'Mars-Saturn': 'Action meets resistance. Everything takes more effort and produces less visible result. Frustration with authority or rules simmers. Patience and disciplined effort are required. Physical strain or injury from pushing too hard is a risk. Slow is fast here.',
  'Mars-Uranus': 'Impulsive, erratic energy. Accidents happen when you rush. But sudden decisive action in the right moment can produce breakthrough results. Your need for independence becomes physical and urgent. Routine feels unbearable. Release the pressure safely.',
  'Mars-Neptune': 'Energy dissolves into confusion or idealism. Physical vitality drops. Actions motivated by compassion or creativity go well; actions motivated by ego or competition fail. Passive-aggressive behavior increases. Swimming, yoga, or artistic work channels this better than confrontation.',
  'Mars-Pluto': 'Willpower is enormous but volatile. You can accomplish things through sheer force of determination that would normally be impossible. But rage, obsession, and power struggles are equally likely. This is raw power: dangerous if unconscious, transformative if directed.',

  // --- Venus transits (2-3 days per aspect, pleasant and social) ---
  'Venus-Sun': 'A few days of increased attractiveness, social ease, and creative energy. Good for dates, presentations, shopping, and anything where making a good impression matters. You feel more beautiful and receive more compliments than usual.',
  'Venus-Moon': 'Emotional warmth and comfort. A pleasant few days for domestic life, family gatherings, and nurturing relationships. Cooking, decorating, and self-care feel especially satisfying. Nostalgia and sentimentality are heightened.',
  'Venus-Mercury': 'Communication becomes charming and diplomatic. Good for writing love letters, negotiating, and social networking. Conversations are pleasant and productive. Aesthetic appreciation is heightened: good day for art, music, or design work.',
  'Venus-Venus': 'A Venus return (yearly). Your relationship patterns, aesthetic preferences, and value system refresh. A good day to evaluate what you love, what you find beautiful, and whether your spending aligns with your actual values.',
  'Venus-Mars': 'Attraction and desire are stimulated. Romantic and sexual energy is high. Creative projects that combine beauty with action thrive. Social confidence peaks. A good time to ask for what you want in relationships.',
  'Venus-Jupiter': 'Generosity, optimism, and social pleasure expand. A lovely few days for parties, travel, and indulgence. Financial luck is slightly better than average. The risk is overspending or overindulging. Enjoy the abundance without excess.',
  'Venus-Saturn': 'Relationships feel serious or heavy. You evaluate love and friendship with a critical eye. Loneliness or distance from others is possible. But commitments made or reaffirmed now are solid. Beauty that lasts requires structure.',
  'Venus-Uranus': 'Attraction to the unusual. You may meet someone exciting or experience a sudden shift in what you find appealing. Existing relationships need fresh stimulation. Routine in love becomes intolerable. Financial surprises (positive or negative) are possible.',
  'Venus-Neptune': 'Romance is dreamy and idealized. Artistic and musical sensitivity peaks. You see beauty everywhere. But you may also see beauty where it is not: be cautious about new relationships and financial decisions. Enjoy the inspiration without committing to illusions.',
  'Venus-Pluto': 'Desire becomes intense and obsessive. Relationships deepen or reveal hidden dynamics. Jealousy, possessiveness, and magnetic attraction are all possible. Financial power plays may occur. The encounter that happens now, however brief, leaves a mark.',

  // --- Mercury transits (1-2 days per aspect, mental and communicative) ---
  'Mercury-Sun': 'A day or two of mental clarity about your identity and direction. Good for self-reflection, personal branding, and communicating who you are. Ideas about your path crystallize. Conversations about your future are productive.',
  'Mercury-Moon': 'Thinking and feeling connect. Good for journaling, therapy sessions, and emotional conversations. You can articulate feelings that usually stay vague. Memory is strong. Conversations with family or about domestic matters are productive.',
  'Mercury-Mercury': 'A Mercury return (3-4 times per year). Your communication style and thinking patterns refresh. Good for writing, speaking, and intellectual projects. New ideas flow easily. Revisit projects that stalled due to unclear thinking.',
  'Mercury-Venus': 'Pleasant communication. Good for love letters, social media, negotiation, and any conversation where charm matters. Aesthetic decisions come easily. Shopping is satisfying. Words are diplomatic and well-received.',
  'Mercury-Mars': 'Sharp, assertive thinking. Good for debates, competitive writing, and solving problems that require aggressive mental focus. Bad for sensitive conversations. Words come out more cutting than intended. Channel the mental energy into productive argumentation.',
  'Mercury-Jupiter': 'Big-picture thinking. Good for planning, teaching, publishing, and legal matters. Your ideas reach a wider context. Optimism colors your thinking, which can be inspiring or unrealistic. Travel communication goes well.',
  'Mercury-Saturn': 'Thinking becomes heavy, practical, and pessimistic. Good for detailed work, editing, contracts, and any task requiring precision over inspiration. Conversations feel burdensome. Focus on getting the hard mental work done; creativity returns later.',
  'Mercury-Uranus': 'Sudden insights and unconventional ideas. Your mind works faster than usual and makes unexpected connections. Good for brainstorming, technology work, and breaking out of mental ruts. Nervous energy is high. The idea that arrives out of nowhere may be brilliant.',
  'Mercury-Neptune': 'Thinking becomes dreamy, unfocused, and imaginative. Poor for contracts, detailed work, and fact-checking. Excellent for creative writing, music, and meditation. Miscommunication is likely. Read important messages twice before responding.',
  'Mercury-Pluto': 'Mental intensity peaks. You see through lies and surface explanations. Good for research, investigation, therapy, and any conversation that needs to go deep. Obsessive thinking is possible. You may say something that cannot be unsaid.',

  // --- Sun transits (1-2 days per aspect, highlighting and energizing) ---
  'Sun-Sun': 'Your solar return (birthday). The year ahead is seeded. Your vitality, purpose, and identity are renewed. How you feel on this day and the days around it often sets the tone for the coming year.',
  'Sun-Moon': 'A spotlight on your emotional needs and domestic life. The tension or harmony between what you want (Sun) and what you need (Moon) becomes visible. A good day for honest self-reflection about your inner state.',
  'Sun-Mercury': 'Mental energy and self-expression align. Good for presentations, writing, and any communication where you need to be both clear and authentic. Your ideas get noticed. Short trips and conversations are energized.',
  'Sun-Venus': 'A day of increased social appeal, romantic opportunity, and creative energy. People notice your charm. Good for dates, art, shopping, and anything where beauty or connection matters. Financial gains through social connections are possible.',
  'Sun-Mars': 'Energy and assertiveness spike for a day or two. Good for physical activity, competition, and taking initiative. Ego conflicts with men or authority figures are possible. The fire needs somewhere to go: choose a target before it finds one.',
  'Sun-Jupiter': 'Optimism, generosity, and opportunity converge briefly. A good day for big decisions, travel plans, and expanding your reach. Everything feels possible, and more of it actually is than usual. Enjoy the confidence without overcommitting.',
  'Sun-Saturn': 'A day of heaviness, responsibility, and reality. Tasks feel harder and rewards feel smaller. But the work you do today holds. Authority figures may criticize or test you. Rise to it; this earns lasting respect.',
  'Sun-Uranus': 'A day of surprises, restlessness, and the need to break free from routine. Unexpected events disrupt plans but may lead somewhere better. Your individuality demands expression. Do something you have never done before.',
  'Sun-Neptune': 'A day of dreaminess, sensitivity, and blurred boundaries. Creativity and compassion are heightened. Practical matters suffer from lack of focus. A good day for art, meditation, or helping someone. A bad day for contracts and major decisions.',
  'Sun-Pluto': 'Intensity peaks for a day. Power dynamics surface in relationships or at work. You may feel driven to control a situation or discover something hidden. Encounters are meaningful even if brief. Let go of what no longer serves you.',

  // --- Moon transits (hours, not days - fastest moving) ---
  'Moon-Sun': 'A few hours of emotional clarity about your identity and direction. Your feelings and your purpose align or clash noticeably. Brief but telling: pay attention to what surfaces.',
  'Moon-Moon': 'A lunar return (monthly). Your emotional baseline resets. How you feel today reflects your emotional truth for the coming month. Domestic and family themes are highlighted.',
  'Moon-Mercury': 'Emotions and thoughts connect for a few hours. Good for journaling, emotional conversations, and processing feelings through words. Your instincts inform your thinking more than usual.',
  'Moon-Venus': 'A few hours of emotional warmth, social pleasure, and comfort-seeking. Good for connecting with loved ones, comfort food, and beauty. Brief but genuinely pleasant.',
  'Moon-Mars': 'Emotional reactivity spikes briefly. Irritability, impatience, and gut-level responses to provocation. A brief transit but it can trigger arguments if you are not aware of the heightened sensitivity. Physical activity helps.',
  'Moon-Jupiter': 'A few hours of emotional generosity and optimism. You feel expansive, caring, and hopeful. Good for socializing and domestic warmth. Brief but genuinely uplifting.',
  'Moon-Saturn': 'A few hours of emotional heaviness or loneliness. Responsibilities weigh on your mood. Not the time for emotional risks. Brief but can color your whole day if you let it. Structure and discipline help.',
  'Moon-Uranus': 'Emotional restlessness and sudden mood shifts. You crave excitement and react against routine. Brief but potentially disruptive if you act on impulse. Let the feeling pass before making decisions.',
  'Moon-Neptune': 'A few hours of heightened sensitivity, dreaminess, and emotional absorption. Your boundaries are thin. Good for creative work and meditation. Bad for confrontation. Brief but potent for artists.',
  'Moon-Pluto': 'Emotional intensity surges briefly. Deep feelings surface: jealousy, desire, grief, or power needs. Interactions feel heavy and meaningful. A few hours that can reveal what you usually keep buried.',
};

// How each aspect type modifies the delivery of the transit
const ASPECT_MODIFIER: Record<string, string> = {
  conjunction: '',
  sextile: 'This arrives as an opportunity rather than a demand. You have to reach for it.',
  square: 'This arrives as pressure. Something needs to shift, and comfort is not an option until it does.',
  trine: 'This arrives easily. The energy flows without resistance, almost too smoothly to notice.',
  quincunx: 'This arrives as an awkward misalignment. Two parts of your life need adjustment that neither is naturally inclined to make.',
  opposition: 'This arrives through other people or external events. The mirror is outside you.',
};

// ---------------------------------------------------------------------------
// Lookup functions
// ---------------------------------------------------------------------------

export function getPlanetInSignText(planet: string, sign: string): string | null {
  return PLANET_IN_SIGN[`${planet}-${sign}`] ?? null;
}

export function getPlanetInHouseText(planet: string, house: number): string | null {
  return PLANET_IN_HOUSE[`${planet}-${house}`] ?? null;
}

export function getAspectText(aspectType: string): string | null {
  return ASPECT_TEXTS[aspectType] ?? null;
}

// Transit-specific interpretation using planet-pair entries + aspect modifier
export function getTransitText(transitPlanet: string, natalPlanet: string, aspectType: string): string {
  const key = `${transitPlanet}-${natalPlanet}`;
  const pairText = TRANSIT_PAIRS[key];
  const modifier = ASPECT_MODIFIER[aspectType] ?? '';

  if (pairText) {
    return modifier ? `${pairText} ${modifier}` : pairText;
  }

  // Fallback for any pairs not covered
  return `Transit ${transitPlanet} contacts your natal ${natalPlanet}. ${modifier}`;
}
