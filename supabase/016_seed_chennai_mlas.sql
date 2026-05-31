-- Chennai elected MLAs (2026 Tamil Nadu assembly elections).
-- Regenerate: node scripts/import-chennai-mlas.mjs
-- Results: https://data.opencity.in/dataset/tamil-nadu-final-results-2026 (ECI)
-- Ward→AC mapping: spatial join of chennai-wards.geojson × tn_acs_map.kml (OpenCity)
-- 200 MLA rows across 23 assembly constituencies.
-- Contact fields use TN Legislative Assembly Secretariat; per-MLA contacts are not in the public ECI dataset.
-- MLA photos: https://myneta.info/TamilNadu2026/ (ADR/ECI affidavit portraits).
-- Regenerate photos: node scripts/fetch-myneta-mla-photos.mjs

-- Backfill assembly constituency on wards (derived mapping).
update public.wards set assembly_constituency = 'Tiruvottiyur' where id = 'ward-001';
update public.wards set assembly_constituency = 'Tiruvottiyur' where id = 'ward-002';
update public.wards set assembly_constituency = 'Tiruvottiyur' where id = 'ward-003';
update public.wards set assembly_constituency = 'Tiruvottiyur' where id = 'ward-004';
update public.wards set assembly_constituency = 'Tiruvottiyur' where id = 'ward-005';
update public.wards set assembly_constituency = 'Tiruvottiyur' where id = 'ward-006';
update public.wards set assembly_constituency = 'Tiruvottiyur' where id = 'ward-007';
update public.wards set assembly_constituency = 'Tiruvottiyur' where id = 'ward-008';
update public.wards set assembly_constituency = 'Tiruvottiyur' where id = 'ward-009';
update public.wards set assembly_constituency = 'Tiruvottiyur' where id = 'ward-010';
update public.wards set assembly_constituency = 'Tiruvottiyur' where id = 'ward-011';
update public.wards set assembly_constituency = 'Tiruvottiyur' where id = 'ward-012';
update public.wards set assembly_constituency = 'Tiruvottiyur' where id = 'ward-013';
update public.wards set assembly_constituency = 'Tiruvottiyur' where id = 'ward-014';
update public.wards set assembly_constituency = 'Ponneri' where id = 'ward-015';
update public.wards set assembly_constituency = 'Madavaram' where id = 'ward-016';
update public.wards set assembly_constituency = 'Madavaram' where id = 'ward-017';
update public.wards set assembly_constituency = 'Tiruvottiyur' where id = 'ward-018';
update public.wards set assembly_constituency = 'Madavaram' where id = 'ward-019';
update public.wards set assembly_constituency = 'Tiruvottiyur' where id = 'ward-020';
update public.wards set assembly_constituency = 'Tiruvottiyur' where id = 'ward-021';
update public.wards set assembly_constituency = 'Madavaram' where id = 'ward-022';
update public.wards set assembly_constituency = 'Madavaram' where id = 'ward-023';
update public.wards set assembly_constituency = 'Madavaram' where id = 'ward-024';
update public.wards set assembly_constituency = 'Madavaram' where id = 'ward-025';
update public.wards set assembly_constituency = 'Madavaram' where id = 'ward-026';
update public.wards set assembly_constituency = 'Madavaram' where id = 'ward-027';
update public.wards set assembly_constituency = 'Madavaram' where id = 'ward-028';
update public.wards set assembly_constituency = 'Tiruvottiyur' where id = 'ward-029';
update public.wards set assembly_constituency = 'Madavaram' where id = 'ward-030';
update public.wards set assembly_constituency = 'Madavaram' where id = 'ward-031';
update public.wards set assembly_constituency = 'Madavaram' where id = 'ward-032';
update public.wards set assembly_constituency = 'Madavaram' where id = 'ward-033';
update public.wards set assembly_constituency = 'Perambur' where id = 'ward-034';
update public.wards set assembly_constituency = 'Perambur' where id = 'ward-035';
update public.wards set assembly_constituency = 'Perambur' where id = 'ward-036';
update public.wards set assembly_constituency = 'Perambur' where id = 'ward-037';
update public.wards set assembly_constituency = 'Dr. Radhakrishnan Naga' where id = 'ward-038';
update public.wards set assembly_constituency = 'Dr. Radhakrishnan Naga' where id = 'ward-039';
update public.wards set assembly_constituency = 'Dr. Radhakrishnan Naga' where id = 'ward-040';
update public.wards set assembly_constituency = 'Dr. Radhakrishnan Naga' where id = 'ward-041';
update public.wards set assembly_constituency = 'Dr. Radhakrishnan Naga' where id = 'ward-042';
update public.wards set assembly_constituency = 'Dr. Radhakrishnan Naga' where id = 'ward-043';
update public.wards set assembly_constituency = 'Perambur' where id = 'ward-044';
update public.wards set assembly_constituency = 'Perambur' where id = 'ward-045';
update public.wards set assembly_constituency = 'Perambur' where id = 'ward-046';
update public.wards set assembly_constituency = 'Dr. Radhakrishnan Naga' where id = 'ward-047';
update public.wards set assembly_constituency = 'Dr. Radhakrishnan Naga' where id = 'ward-048';
update public.wards set assembly_constituency = 'Royapuram' where id = 'ward-049';
update public.wards set assembly_constituency = 'Royapuram' where id = 'ward-050';
update public.wards set assembly_constituency = 'Royapuram' where id = 'ward-051';
update public.wards set assembly_constituency = 'Royapuram' where id = 'ward-052';
update public.wards set assembly_constituency = 'Royapuram' where id = 'ward-053';
update public.wards set assembly_constituency = 'Harbour' where id = 'ward-054';
update public.wards set assembly_constituency = 'Harbour' where id = 'ward-055';
update public.wards set assembly_constituency = 'Harbour' where id = 'ward-056';
update public.wards set assembly_constituency = 'Harbour' where id = 'ward-057';
update public.wards set assembly_constituency = 'Egmore' where id = 'ward-058';
update public.wards set assembly_constituency = 'Harbour' where id = 'ward-059';
update public.wards set assembly_constituency = 'Harbour' where id = 'ward-060';
update public.wards set assembly_constituency = 'Egmore' where id = 'ward-061';
update public.wards set assembly_constituency = 'Chepauk-Thiruvalliken' where id = 'ward-062';
update public.wards set assembly_constituency = 'Chepauk-Thiruvalliken' where id = 'ward-063';
update public.wards set assembly_constituency = 'Kolathur' where id = 'ward-064';
update public.wards set assembly_constituency = 'Kolathur' where id = 'ward-065';
update public.wards set assembly_constituency = 'Kolathur' where id = 'ward-066';
update public.wards set assembly_constituency = 'Kolathur' where id = 'ward-067';
update public.wards set assembly_constituency = 'Kolathur' where id = 'ward-068';
update public.wards set assembly_constituency = 'Kolathur' where id = 'ward-069';
update public.wards set assembly_constituency = 'Thiru-Vi-Ka-Nagar' where id = 'ward-070';
update public.wards set assembly_constituency = 'Thiru-Vi-Ka-Nagar' where id = 'ward-071';
update public.wards set assembly_constituency = 'Thiru-Vi-Ka-Nagar' where id = 'ward-072';
update public.wards set assembly_constituency = 'Thiru-Vi-Ka-Nagar' where id = 'ward-073';
update public.wards set assembly_constituency = 'Thiru-Vi-Ka-Nagar' where id = 'ward-074';
update public.wards set assembly_constituency = 'Thiru-Vi-Ka-Nagar' where id = 'ward-075';
update public.wards set assembly_constituency = 'Thiru-Vi-Ka-Nagar' where id = 'ward-076';
update public.wards set assembly_constituency = 'Egmore' where id = 'ward-077';
update public.wards set assembly_constituency = 'Egmore' where id = 'ward-078';
update public.wards set assembly_constituency = 'Ambattur' where id = 'ward-079';
update public.wards set assembly_constituency = 'Ambattur' where id = 'ward-080';
update public.wards set assembly_constituency = 'Ambattur' where id = 'ward-081';
update public.wards set assembly_constituency = 'Ambattur' where id = 'ward-082';
update public.wards set assembly_constituency = 'Ambattur' where id = 'ward-083';
update public.wards set assembly_constituency = 'Ambattur' where id = 'ward-084';
update public.wards set assembly_constituency = 'Ambattur' where id = 'ward-085';
update public.wards set assembly_constituency = 'Ambattur' where id = 'ward-086';
update public.wards set assembly_constituency = 'Ambattur' where id = 'ward-087';
update public.wards set assembly_constituency = 'Ambattur' where id = 'ward-088';
update public.wards set assembly_constituency = 'Ambattur' where id = 'ward-089';
update public.wards set assembly_constituency = 'Ambattur' where id = 'ward-090';
update public.wards set assembly_constituency = 'Ambattur' where id = 'ward-091';
update public.wards set assembly_constituency = 'Ambattur' where id = 'ward-092';
update public.wards set assembly_constituency = 'Ambattur' where id = 'ward-093';
update public.wards set assembly_constituency = 'Villivakkam' where id = 'ward-094';
update public.wards set assembly_constituency = 'Villivakkam' where id = 'ward-095';
update public.wards set assembly_constituency = 'Villivakkam' where id = 'ward-096';
update public.wards set assembly_constituency = 'Villivakkam' where id = 'ward-097';
update public.wards set assembly_constituency = 'Villivakkam' where id = 'ward-098';
update public.wards set assembly_constituency = 'Villivakkam' where id = 'ward-099';
update public.wards set assembly_constituency = 'Anna Nagar' where id = 'ward-100';
update public.wards set assembly_constituency = 'Anna Nagar' where id = 'ward-101';
update public.wards set assembly_constituency = 'Anna Nagar' where id = 'ward-102';
update public.wards set assembly_constituency = 'Anna Nagar' where id = 'ward-103';
update public.wards set assembly_constituency = 'Anna Nagar' where id = 'ward-104';
update public.wards set assembly_constituency = 'Anna Nagar' where id = 'ward-105';
update public.wards set assembly_constituency = 'Anna Nagar' where id = 'ward-106';
update public.wards set assembly_constituency = 'Egmore' where id = 'ward-107';
update public.wards set assembly_constituency = 'Anna Nagar' where id = 'ward-108';
update public.wards set assembly_constituency = 'Thousand Lights' where id = 'ward-109';
update public.wards set assembly_constituency = 'Thousand Lights' where id = 'ward-110';
update public.wards set assembly_constituency = 'Thousand Lights' where id = 'ward-111';
update public.wards set assembly_constituency = 'Thousand Lights' where id = 'ward-112';
update public.wards set assembly_constituency = 'Thousand Lights' where id = 'ward-113';
update public.wards set assembly_constituency = 'Chepauk-Thiruvalliken' where id = 'ward-114';
update public.wards set assembly_constituency = 'Chepauk-Thiruvalliken' where id = 'ward-115';
update public.wards set assembly_constituency = 'Chepauk-Thiruvalliken' where id = 'ward-116';
update public.wards set assembly_constituency = 'Thousand Lights' where id = 'ward-117';
update public.wards set assembly_constituency = 'Thousand Lights' where id = 'ward-118';
update public.wards set assembly_constituency = 'Chepauk-Thiruvalliken' where id = 'ward-119';
update public.wards set assembly_constituency = 'Chepauk-Thiruvalliken' where id = 'ward-120';
update public.wards set assembly_constituency = 'Mylapore' where id = 'ward-121';
update public.wards set assembly_constituency = 'Mylapore' where id = 'ward-122';
update public.wards set assembly_constituency = 'Mylapore' where id = 'ward-123';
update public.wards set assembly_constituency = 'Mylapore' where id = 'ward-124';
update public.wards set assembly_constituency = 'Mylapore' where id = 'ward-125';
update public.wards set assembly_constituency = 'Mylapore' where id = 'ward-126';
update public.wards set assembly_constituency = 'Virugampakkam' where id = 'ward-127';
update public.wards set assembly_constituency = 'Virugampakkam' where id = 'ward-128';
update public.wards set assembly_constituency = 'Virugampakkam' where id = 'ward-129';
update public.wards set assembly_constituency = 'Thiyagarayanagar' where id = 'ward-130';
update public.wards set assembly_constituency = 'Virugampakkam' where id = 'ward-131';
update public.wards set assembly_constituency = 'Thiyagarayanagar' where id = 'ward-132';
update public.wards set assembly_constituency = 'Thiyagarayanagar' where id = 'ward-133';
update public.wards set assembly_constituency = 'Thiyagarayanagar' where id = 'ward-134';
update public.wards set assembly_constituency = 'Thiyagarayanagar' where id = 'ward-135';
update public.wards set assembly_constituency = 'Thiyagarayanagar' where id = 'ward-136';
update public.wards set assembly_constituency = 'Virugampakkam' where id = 'ward-137';
update public.wards set assembly_constituency = 'Virugampakkam' where id = 'ward-138';
update public.wards set assembly_constituency = 'Saidapet' where id = 'ward-139';
update public.wards set assembly_constituency = 'Saidapet' where id = 'ward-140';
update public.wards set assembly_constituency = 'Thousand Lights' where id = 'ward-141';
update public.wards set assembly_constituency = 'Saidapet' where id = 'ward-142';
update public.wards set assembly_constituency = 'Maduravoyal' where id = 'ward-143';
update public.wards set assembly_constituency = 'Maduravoyal' where id = 'ward-144';
update public.wards set assembly_constituency = 'Maduravoyal' where id = 'ward-145';
update public.wards set assembly_constituency = 'Maduravoyal' where id = 'ward-146';
update public.wards set assembly_constituency = 'Maduravoyal' where id = 'ward-147';
update public.wards set assembly_constituency = 'Maduravoyal' where id = 'ward-148';
update public.wards set assembly_constituency = 'Maduravoyal' where id = 'ward-149';
update public.wards set assembly_constituency = 'Maduravoyal' where id = 'ward-150';
update public.wards set assembly_constituency = 'Maduravoyal' where id = 'ward-151';
update public.wards set assembly_constituency = 'Maduravoyal' where id = 'ward-152';
update public.wards set assembly_constituency = 'Alandur' where id = 'ward-153';
update public.wards set assembly_constituency = 'Maduravoyal' where id = 'ward-154';
update public.wards set assembly_constituency = 'Maduravoyal' where id = 'ward-155';
update public.wards set assembly_constituency = 'Alandur' where id = 'ward-156';
update public.wards set assembly_constituency = 'Alandur' where id = 'ward-157';
update public.wards set assembly_constituency = 'Alandur' where id = 'ward-158';
update public.wards set assembly_constituency = 'Alandur' where id = 'ward-159';
update public.wards set assembly_constituency = 'Alandur' where id = 'ward-160';
update public.wards set assembly_constituency = 'Alandur' where id = 'ward-161';
update public.wards set assembly_constituency = 'Alandur' where id = 'ward-162';
update public.wards set assembly_constituency = 'Alandur' where id = 'ward-163';
update public.wards set assembly_constituency = 'Alandur' where id = 'ward-164';
update public.wards set assembly_constituency = 'Alandur' where id = 'ward-165';
update public.wards set assembly_constituency = 'Alandur' where id = 'ward-166';
update public.wards set assembly_constituency = 'Alandur' where id = 'ward-167';
update public.wards set assembly_constituency = 'Alandur' where id = 'ward-168';
update public.wards set assembly_constituency = 'Shozhinganallur' where id = 'ward-169';
update public.wards set assembly_constituency = 'Saidapet' where id = 'ward-170';
update public.wards set assembly_constituency = 'Saidapet' where id = 'ward-171';
update public.wards set assembly_constituency = 'Saidapet' where id = 'ward-172';
update public.wards set assembly_constituency = 'Mylapore' where id = 'ward-173';
update public.wards set assembly_constituency = 'Saidapet' where id = 'ward-174';
update public.wards set assembly_constituency = 'Velachery' where id = 'ward-175';
update public.wards set assembly_constituency = 'Velachery' where id = 'ward-176';
update public.wards set assembly_constituency = 'Velachery' where id = 'ward-177';
update public.wards set assembly_constituency = 'Velachery' where id = 'ward-178';
update public.wards set assembly_constituency = 'Velachery' where id = 'ward-179';
update public.wards set assembly_constituency = 'Velachery' where id = 'ward-180';
update public.wards set assembly_constituency = 'Velachery' where id = 'ward-181';
update public.wards set assembly_constituency = 'Velachery' where id = 'ward-182';
update public.wards set assembly_constituency = 'Shozhinganallur' where id = 'ward-183';
update public.wards set assembly_constituency = 'Shozhinganallur' where id = 'ward-184';
update public.wards set assembly_constituency = 'Shozhinganallur' where id = 'ward-185';
update public.wards set assembly_constituency = 'Shozhinganallur' where id = 'ward-186';
update public.wards set assembly_constituency = 'Shozhinganallur' where id = 'ward-187';
update public.wards set assembly_constituency = 'Shozhinganallur' where id = 'ward-188';
update public.wards set assembly_constituency = 'Shozhinganallur' where id = 'ward-189';
update public.wards set assembly_constituency = 'Shozhinganallur' where id = 'ward-190';
update public.wards set assembly_constituency = 'Shozhinganallur' where id = 'ward-191';
update public.wards set assembly_constituency = 'Shozhinganallur' where id = 'ward-192';
update public.wards set assembly_constituency = 'Shozhinganallur' where id = 'ward-193';
update public.wards set assembly_constituency = 'Shozhinganallur' where id = 'ward-194';
update public.wards set assembly_constituency = 'Shozhinganallur' where id = 'ward-195';
update public.wards set assembly_constituency = 'Shozhinganallur' where id = 'ward-196';
update public.wards set assembly_constituency = 'Shozhinganallur' where id = 'ward-197';
update public.wards set assembly_constituency = 'Shozhinganallur' where id = 'ward-198';
update public.wards set assembly_constituency = 'Shozhinganallur' where id = 'ward-199';
update public.wards set assembly_constituency = 'Shozhinganallur' where id = 'ward-200';

insert into public.representatives (
  id, ward_id, name, role, area, constituency, party, party_color, photo_url,
  email, helpline, office_hours, preferred_channel
)
values
  ('rep-ward-001-mla', 'ward-001', 'Senthil Kumar. N.', 'MLA',
   'Ward 1, Zone Thiruvottiyur', 'Tiruvottiyur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/0e1dab0bf3bcba6a7491fc445dfc1b775f8544a5.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-002-mla', 'ward-002', 'Senthil Kumar. N.', 'MLA',
   'Ward 2, Zone Thiruvottiyur', 'Tiruvottiyur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/0e1dab0bf3bcba6a7491fc445dfc1b775f8544a5.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-003-mla', 'ward-003', 'Senthil Kumar. N.', 'MLA',
   'Ward 3, Zone Thiruvottiyur', 'Tiruvottiyur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/0e1dab0bf3bcba6a7491fc445dfc1b775f8544a5.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-004-mla', 'ward-004', 'Senthil Kumar. N.', 'MLA',
   'Ward 4, Zone Thiruvottiyur', 'Tiruvottiyur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/0e1dab0bf3bcba6a7491fc445dfc1b775f8544a5.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-005-mla', 'ward-005', 'Senthil Kumar. N.', 'MLA',
   'Ward 5, Zone Thiruvottiyur', 'Tiruvottiyur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/0e1dab0bf3bcba6a7491fc445dfc1b775f8544a5.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-006-mla', 'ward-006', 'Senthil Kumar. N.', 'MLA',
   'Ward 6, Zone Thiruvottiyur', 'Tiruvottiyur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/0e1dab0bf3bcba6a7491fc445dfc1b775f8544a5.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-007-mla', 'ward-007', 'Senthil Kumar. N.', 'MLA',
   'Ward 7, Zone Thiruvottiyur', 'Tiruvottiyur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/0e1dab0bf3bcba6a7491fc445dfc1b775f8544a5.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-008-mla', 'ward-008', 'Senthil Kumar. N.', 'MLA',
   'Ward 8, Zone Thiruvottiyur', 'Tiruvottiyur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/0e1dab0bf3bcba6a7491fc445dfc1b775f8544a5.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-009-mla', 'ward-009', 'Senthil Kumar. N.', 'MLA',
   'Ward 9, Zone Thiruvottiyur', 'Tiruvottiyur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/0e1dab0bf3bcba6a7491fc445dfc1b775f8544a5.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-010-mla', 'ward-010', 'Senthil Kumar. N.', 'MLA',
   'Ward 10, Zone Thiruvottiyur', 'Tiruvottiyur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/0e1dab0bf3bcba6a7491fc445dfc1b775f8544a5.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-011-mla', 'ward-011', 'Senthil Kumar. N.', 'MLA',
   'Ward 11, Zone Thiruvottiyur', 'Tiruvottiyur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/0e1dab0bf3bcba6a7491fc445dfc1b775f8544a5.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-012-mla', 'ward-012', 'Senthil Kumar. N.', 'MLA',
   'Ward 12, Zone Thiruvottiyur', 'Tiruvottiyur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/0e1dab0bf3bcba6a7491fc445dfc1b775f8544a5.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-013-mla', 'ward-013', 'Senthil Kumar. N.', 'MLA',
   'Ward 13, Zone Thiruvottiyur', 'Tiruvottiyur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/0e1dab0bf3bcba6a7491fc445dfc1b775f8544a5.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-014-mla', 'ward-014', 'Senthil Kumar. N.', 'MLA',
   'Ward 14, Zone Thiruvottiyur', 'Tiruvottiyur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/0e1dab0bf3bcba6a7491fc445dfc1b775f8544a5.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-015-mla', 'ward-015', 'Dr.ravi.m.s', 'MLA',
   'Ward 15, Zone Manali', 'Ponneri',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/d6f36395e90d3794b4bd23cc86372b877a3f39fb.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-016-mla', 'ward-016', 'M.l.vijayprabhu', 'MLA',
   'Ward 16, Zone Manali', 'Madavaram',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/ae7146704be7c3d13c5fe7986c5af85aae11cc8b.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-017-mla', 'ward-017', 'M.l.vijayprabhu', 'MLA',
   'Ward 17, Zone Manali', 'Madavaram',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/ae7146704be7c3d13c5fe7986c5af85aae11cc8b.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-018-mla', 'ward-018', 'Senthil Kumar. N.', 'MLA',
   'Ward 18, Zone Manali', 'Tiruvottiyur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/0e1dab0bf3bcba6a7491fc445dfc1b775f8544a5.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-019-mla', 'ward-019', 'M.l.vijayprabhu', 'MLA',
   'Ward 19, Zone Manali', 'Madavaram',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/ae7146704be7c3d13c5fe7986c5af85aae11cc8b.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-020-mla', 'ward-020', 'Senthil Kumar. N.', 'MLA',
   'Ward 20, Zone Manali', 'Tiruvottiyur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/0e1dab0bf3bcba6a7491fc445dfc1b775f8544a5.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-021-mla', 'ward-021', 'Senthil Kumar. N.', 'MLA',
   'Ward 21, Zone Manali', 'Tiruvottiyur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/0e1dab0bf3bcba6a7491fc445dfc1b775f8544a5.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-022-mla', 'ward-022', 'M.l.vijayprabhu', 'MLA',
   'Ward 22, Zone Madhavaram', 'Madavaram',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/ae7146704be7c3d13c5fe7986c5af85aae11cc8b.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-023-mla', 'ward-023', 'M.l.vijayprabhu', 'MLA',
   'Ward 23, Zone Madhavaram', 'Madavaram',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/ae7146704be7c3d13c5fe7986c5af85aae11cc8b.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-024-mla', 'ward-024', 'M.l.vijayprabhu', 'MLA',
   'Ward 24, Zone Madhavaram', 'Madavaram',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/ae7146704be7c3d13c5fe7986c5af85aae11cc8b.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-025-mla', 'ward-025', 'M.l.vijayprabhu', 'MLA',
   'Ward 25, Zone Madhavaram', 'Madavaram',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/ae7146704be7c3d13c5fe7986c5af85aae11cc8b.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-026-mla', 'ward-026', 'M.l.vijayprabhu', 'MLA',
   'Ward 26, Zone Madhavaram', 'Madavaram',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/ae7146704be7c3d13c5fe7986c5af85aae11cc8b.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-027-mla', 'ward-027', 'M.l.vijayprabhu', 'MLA',
   'Ward 27, Zone Madhavaram', 'Madavaram',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/ae7146704be7c3d13c5fe7986c5af85aae11cc8b.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-028-mla', 'ward-028', 'M.l.vijayprabhu', 'MLA',
   'Ward 28, Zone Madhavaram', 'Madavaram',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/ae7146704be7c3d13c5fe7986c5af85aae11cc8b.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-029-mla', 'ward-029', 'Senthil Kumar. N.', 'MLA',
   'Ward 29, Zone Madhavaram', 'Tiruvottiyur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/0e1dab0bf3bcba6a7491fc445dfc1b775f8544a5.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-030-mla', 'ward-030', 'M.l.vijayprabhu', 'MLA',
   'Ward 30, Zone Madhavaram', 'Madavaram',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/ae7146704be7c3d13c5fe7986c5af85aae11cc8b.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-031-mla', 'ward-031', 'M.l.vijayprabhu', 'MLA',
   'Ward 31, Zone Madhavaram', 'Madavaram',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/ae7146704be7c3d13c5fe7986c5af85aae11cc8b.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-032-mla', 'ward-032', 'M.l.vijayprabhu', 'MLA',
   'Ward 32, Zone Madhavaram', 'Madavaram',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/ae7146704be7c3d13c5fe7986c5af85aae11cc8b.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-033-mla', 'ward-033', 'M.l.vijayprabhu', 'MLA',
   'Ward 33, Zone Madhavaram', 'Madavaram',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/ae7146704be7c3d13c5fe7986c5af85aae11cc8b.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-034-mla', 'ward-034', 'C. Joseph Vijay', 'MLA',
   'Ward 34, Zone Tondiarpet', 'Perambur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/12fc10ae0930ca18d4cd328f27950ddf67251823.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-035-mla', 'ward-035', 'C. Joseph Vijay', 'MLA',
   'Ward 35, Zone Tondiarpet', 'Perambur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/12fc10ae0930ca18d4cd328f27950ddf67251823.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-036-mla', 'ward-036', 'C. Joseph Vijay', 'MLA',
   'Ward 36, Zone Tondiarpet', 'Perambur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/12fc10ae0930ca18d4cd328f27950ddf67251823.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-037-mla', 'ward-037', 'C. Joseph Vijay', 'MLA',
   'Ward 37, Zone Tondiarpet', 'Perambur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/12fc10ae0930ca18d4cd328f27950ddf67251823.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-038-mla', 'ward-038', 'N. Marie Wilson', 'MLA',
   'Ward 38, Zone Tondiarpet', 'Dr. Radhakrishnan Naga',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/4cd070bcc2544fbf6d83794eb93d6ac4f67ec7e7.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-039-mla', 'ward-039', 'N. Marie Wilson', 'MLA',
   'Ward 39, Zone Tondiarpet', 'Dr. Radhakrishnan Naga',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/4cd070bcc2544fbf6d83794eb93d6ac4f67ec7e7.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-040-mla', 'ward-040', 'N. Marie Wilson', 'MLA',
   'Ward 40, Zone Tondiarpet', 'Dr. Radhakrishnan Naga',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/4cd070bcc2544fbf6d83794eb93d6ac4f67ec7e7.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-041-mla', 'ward-041', 'N. Marie Wilson', 'MLA',
   'Ward 41, Zone Tondiarpet', 'Dr. Radhakrishnan Naga',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/4cd070bcc2544fbf6d83794eb93d6ac4f67ec7e7.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-042-mla', 'ward-042', 'N. Marie Wilson', 'MLA',
   'Ward 42, Zone Tondiarpet', 'Dr. Radhakrishnan Naga',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/4cd070bcc2544fbf6d83794eb93d6ac4f67ec7e7.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-043-mla', 'ward-043', 'N. Marie Wilson', 'MLA',
   'Ward 43, Zone Tondiarpet', 'Dr. Radhakrishnan Naga',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/4cd070bcc2544fbf6d83794eb93d6ac4f67ec7e7.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-044-mla', 'ward-044', 'C. Joseph Vijay', 'MLA',
   'Ward 44, Zone Tondiarpet', 'Perambur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/12fc10ae0930ca18d4cd328f27950ddf67251823.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-045-mla', 'ward-045', 'C. Joseph Vijay', 'MLA',
   'Ward 45, Zone Tondiarpet', 'Perambur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/12fc10ae0930ca18d4cd328f27950ddf67251823.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-046-mla', 'ward-046', 'C. Joseph Vijay', 'MLA',
   'Ward 46, Zone Tondiarpet', 'Perambur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/12fc10ae0930ca18d4cd328f27950ddf67251823.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-047-mla', 'ward-047', 'N. Marie Wilson', 'MLA',
   'Ward 47, Zone Tondiarpet', 'Dr. Radhakrishnan Naga',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/4cd070bcc2544fbf6d83794eb93d6ac4f67ec7e7.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-048-mla', 'ward-048', 'N. Marie Wilson', 'MLA',
   'Ward 48, Zone Tondiarpet', 'Dr. Radhakrishnan Naga',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/4cd070bcc2544fbf6d83794eb93d6ac4f67ec7e7.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-049-mla', 'ward-049', 'K V. Vijay Damu', 'MLA',
   'Ward 49, Zone Royapuram', 'Royapuram',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/e2cbc2d2dc1ada8d030fc9dd7f72696df30f95c6.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-050-mla', 'ward-050', 'K V. Vijay Damu', 'MLA',
   'Ward 50, Zone Royapuram', 'Royapuram',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/e2cbc2d2dc1ada8d030fc9dd7f72696df30f95c6.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-051-mla', 'ward-051', 'K V. Vijay Damu', 'MLA',
   'Ward 51, Zone Royapuram', 'Royapuram',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/e2cbc2d2dc1ada8d030fc9dd7f72696df30f95c6.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-052-mla', 'ward-052', 'K V. Vijay Damu', 'MLA',
   'Ward 52, Zone Royapuram', 'Royapuram',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/e2cbc2d2dc1ada8d030fc9dd7f72696df30f95c6.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-053-mla', 'ward-053', 'K V. Vijay Damu', 'MLA',
   'Ward 53, Zone Royapuram', 'Royapuram',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/e2cbc2d2dc1ada8d030fc9dd7f72696df30f95c6.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-054-mla', 'ward-054', 'P. K. Sekarbabu', 'MLA',
   'Ward 54, Zone Royapuram', 'Harbour',
   'DMK', '#e3000f', 'https://myneta.info/images_candidate/TamilNadu2026/d3be6efb9c0c2e1f7bcad59e1a28648987c3f7d1.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-055-mla', 'ward-055', 'P. K. Sekarbabu', 'MLA',
   'Ward 55, Zone Royapuram', 'Harbour',
   'DMK', '#e3000f', 'https://myneta.info/images_candidate/TamilNadu2026/d3be6efb9c0c2e1f7bcad59e1a28648987c3f7d1.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-056-mla', 'ward-056', 'P. K. Sekarbabu', 'MLA',
   'Ward 56, Zone Royapuram', 'Harbour',
   'DMK', '#e3000f', 'https://myneta.info/images_candidate/TamilNadu2026/d3be6efb9c0c2e1f7bcad59e1a28648987c3f7d1.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-057-mla', 'ward-057', 'P. K. Sekarbabu', 'MLA',
   'Ward 57, Zone Royapuram', 'Harbour',
   'DMK', '#e3000f', 'https://myneta.info/images_candidate/TamilNadu2026/d3be6efb9c0c2e1f7bcad59e1a28648987c3f7d1.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-058-mla', 'ward-058', 'Rajmohan', 'MLA',
   'Ward 58, Zone Royapuram', 'Egmore',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/e29819ca1417db52d247984510ab7d6fad0b18b8.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-059-mla', 'ward-059', 'P. K. Sekarbabu', 'MLA',
   'Ward 59, Zone Royapuram', 'Harbour',
   'DMK', '#e3000f', 'https://myneta.info/images_candidate/TamilNadu2026/d3be6efb9c0c2e1f7bcad59e1a28648987c3f7d1.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-060-mla', 'ward-060', 'P. K. Sekarbabu', 'MLA',
   'Ward 60, Zone Royapuram', 'Harbour',
   'DMK', '#e3000f', 'https://myneta.info/images_candidate/TamilNadu2026/d3be6efb9c0c2e1f7bcad59e1a28648987c3f7d1.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-061-mla', 'ward-061', 'Rajmohan', 'MLA',
   'Ward 61, Zone Royapuram', 'Egmore',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/e29819ca1417db52d247984510ab7d6fad0b18b8.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-062-mla', 'ward-062', 'Udhayanidhi Stalin', 'MLA',
   'Ward 62, Zone Royapuram', 'Chepauk-Thiruvalliken',
   'DMK', '#e3000f', 'https://myneta.info/images_candidate/TamilNadu2026/c0c41a47841fa08beb31c788e651e810ef397e41.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-063-mla', 'ward-063', 'Udhayanidhi Stalin', 'MLA',
   'Ward 63, Zone Royapuram', 'Chepauk-Thiruvalliken',
   'DMK', '#e3000f', 'https://myneta.info/images_candidate/TamilNadu2026/c0c41a47841fa08beb31c788e651e810ef397e41.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-064-mla', 'ward-064', 'V. S. Babu', 'MLA',
   'Ward 64, Zone Thiru-vi-ka-nagar', 'Kolathur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/b0e406e0f18d25b6654e6a06083ff997b412f2dd.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-065-mla', 'ward-065', 'V. S. Babu', 'MLA',
   'Ward 65, Zone Thiru-vi-ka-nagar', 'Kolathur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/b0e406e0f18d25b6654e6a06083ff997b412f2dd.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-066-mla', 'ward-066', 'V. S. Babu', 'MLA',
   'Ward 66, Zone Thiru-vi-ka-nagar', 'Kolathur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/b0e406e0f18d25b6654e6a06083ff997b412f2dd.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-067-mla', 'ward-067', 'V. S. Babu', 'MLA',
   'Ward 67, Zone Thiru-vi-ka-nagar', 'Kolathur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/b0e406e0f18d25b6654e6a06083ff997b412f2dd.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-068-mla', 'ward-068', 'V. S. Babu', 'MLA',
   'Ward 68, Zone Thiru-vi-ka-nagar', 'Kolathur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/b0e406e0f18d25b6654e6a06083ff997b412f2dd.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-069-mla', 'ward-069', 'V. S. Babu', 'MLA',
   'Ward 69, Zone Thiru-vi-ka-nagar', 'Kolathur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/b0e406e0f18d25b6654e6a06083ff997b412f2dd.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-070-mla', 'ward-070', 'M. R. Pallavi', 'MLA',
   'Ward 70, Zone Thiru-vi-ka-nagar', 'Thiru-Vi-Ka-Nagar',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/badb86b51e9055f9fd26c5f885e937f0961c7d77.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-071-mla', 'ward-071', 'M. R. Pallavi', 'MLA',
   'Ward 71, Zone Thiru-vi-ka-nagar', 'Thiru-Vi-Ka-Nagar',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/badb86b51e9055f9fd26c5f885e937f0961c7d77.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-072-mla', 'ward-072', 'M. R. Pallavi', 'MLA',
   'Ward 72, Zone Thiru-vi-ka-nagar', 'Thiru-Vi-Ka-Nagar',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/badb86b51e9055f9fd26c5f885e937f0961c7d77.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-073-mla', 'ward-073', 'M. R. Pallavi', 'MLA',
   'Ward 73, Zone Thiru-vi-ka-nagar', 'Thiru-Vi-Ka-Nagar',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/badb86b51e9055f9fd26c5f885e937f0961c7d77.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-074-mla', 'ward-074', 'M. R. Pallavi', 'MLA',
   'Ward 74, Zone Thiru-vi-ka-nagar', 'Thiru-Vi-Ka-Nagar',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/badb86b51e9055f9fd26c5f885e937f0961c7d77.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-075-mla', 'ward-075', 'M. R. Pallavi', 'MLA',
   'Ward 75, Zone Thiru-vi-ka-nagar', 'Thiru-Vi-Ka-Nagar',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/badb86b51e9055f9fd26c5f885e937f0961c7d77.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-076-mla', 'ward-076', 'M. R. Pallavi', 'MLA',
   'Ward 76, Zone Thiru-vi-ka-nagar', 'Thiru-Vi-Ka-Nagar',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/badb86b51e9055f9fd26c5f885e937f0961c7d77.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-077-mla', 'ward-077', 'Rajmohan', 'MLA',
   'Ward 77, Zone Thiru-vi-ka-nagar', 'Egmore',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/e29819ca1417db52d247984510ab7d6fad0b18b8.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-078-mla', 'ward-078', 'Rajmohan', 'MLA',
   'Ward 78, Zone Thiru-vi-ka-nagar', 'Egmore',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/e29819ca1417db52d247984510ab7d6fad0b18b8.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-079-mla', 'ward-079', 'Balamurugan G.', 'MLA',
   'Ward 79, Zone Ambattur', 'Ambattur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/3ccf7b62b6a293cb84763a19ea11f42b5d0b8768.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-080-mla', 'ward-080', 'Balamurugan G.', 'MLA',
   'Ward 80, Zone Ambattur', 'Ambattur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/3ccf7b62b6a293cb84763a19ea11f42b5d0b8768.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-081-mla', 'ward-081', 'Balamurugan G.', 'MLA',
   'Ward 81, Zone Ambattur', 'Ambattur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/3ccf7b62b6a293cb84763a19ea11f42b5d0b8768.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-082-mla', 'ward-082', 'Balamurugan G.', 'MLA',
   'Ward 82, Zone Ambattur', 'Ambattur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/3ccf7b62b6a293cb84763a19ea11f42b5d0b8768.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-083-mla', 'ward-083', 'Balamurugan G.', 'MLA',
   'Ward 83, Zone Ambattur', 'Ambattur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/3ccf7b62b6a293cb84763a19ea11f42b5d0b8768.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-084-mla', 'ward-084', 'Balamurugan G.', 'MLA',
   'Ward 84, Zone Ambattur', 'Ambattur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/3ccf7b62b6a293cb84763a19ea11f42b5d0b8768.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-085-mla', 'ward-085', 'Balamurugan G.', 'MLA',
   'Ward 85, Zone Ambattur', 'Ambattur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/3ccf7b62b6a293cb84763a19ea11f42b5d0b8768.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-086-mla', 'ward-086', 'Balamurugan G.', 'MLA',
   'Ward 86, Zone Ambattur', 'Ambattur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/3ccf7b62b6a293cb84763a19ea11f42b5d0b8768.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-087-mla', 'ward-087', 'Balamurugan G.', 'MLA',
   'Ward 87, Zone Ambattur', 'Ambattur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/3ccf7b62b6a293cb84763a19ea11f42b5d0b8768.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-088-mla', 'ward-088', 'Balamurugan G.', 'MLA',
   'Ward 88, Zone Ambattur', 'Ambattur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/3ccf7b62b6a293cb84763a19ea11f42b5d0b8768.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-089-mla', 'ward-089', 'Balamurugan G.', 'MLA',
   'Ward 89, Zone Ambattur', 'Ambattur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/3ccf7b62b6a293cb84763a19ea11f42b5d0b8768.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-090-mla', 'ward-090', 'Balamurugan G.', 'MLA',
   'Ward 90, Zone Ambattur', 'Ambattur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/3ccf7b62b6a293cb84763a19ea11f42b5d0b8768.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-091-mla', 'ward-091', 'Balamurugan G.', 'MLA',
   'Ward 91, Zone Ambattur', 'Ambattur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/3ccf7b62b6a293cb84763a19ea11f42b5d0b8768.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-092-mla', 'ward-092', 'Balamurugan G.', 'MLA',
   'Ward 92, Zone Ambattur', 'Ambattur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/3ccf7b62b6a293cb84763a19ea11f42b5d0b8768.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-093-mla', 'ward-093', 'Balamurugan G.', 'MLA',
   'Ward 93, Zone Ambattur', 'Ambattur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/3ccf7b62b6a293cb84763a19ea11f42b5d0b8768.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-094-mla', 'ward-094', 'Aadhav Arjuna', 'MLA',
   'Ward 94, Zone Annanagar', 'Villivakkam',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/fbec30a219a25544a9f39e9f429e1e066ae2e239.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-095-mla', 'ward-095', 'Aadhav Arjuna', 'MLA',
   'Ward 95, Zone Annanagar', 'Villivakkam',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/fbec30a219a25544a9f39e9f429e1e066ae2e239.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-096-mla', 'ward-096', 'Aadhav Arjuna', 'MLA',
   'Ward 96, Zone Annanagar', 'Villivakkam',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/fbec30a219a25544a9f39e9f429e1e066ae2e239.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-097-mla', 'ward-097', 'Aadhav Arjuna', 'MLA',
   'Ward 97, Zone Annanagar', 'Villivakkam',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/fbec30a219a25544a9f39e9f429e1e066ae2e239.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-098-mla', 'ward-098', 'Aadhav Arjuna', 'MLA',
   'Ward 98, Zone Annanagar', 'Villivakkam',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/fbec30a219a25544a9f39e9f429e1e066ae2e239.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-099-mla', 'ward-099', 'Aadhav Arjuna', 'MLA',
   'Ward 99, Zone Annanagar', 'Villivakkam',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/fbec30a219a25544a9f39e9f429e1e066ae2e239.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-100-mla', 'ward-100', 'V.k.ramkumar', 'MLA',
   'Ward 100, Zone Annanagar', 'Anna Nagar',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/986d0feb95dc9ca216e2905bd24024fba9285947.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-101-mla', 'ward-101', 'V.k.ramkumar', 'MLA',
   'Ward 101, Zone Annanagar', 'Anna Nagar',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/986d0feb95dc9ca216e2905bd24024fba9285947.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-102-mla', 'ward-102', 'V.k.ramkumar', 'MLA',
   'Ward 102, Zone Annanagar', 'Anna Nagar',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/986d0feb95dc9ca216e2905bd24024fba9285947.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-103-mla', 'ward-103', 'V.k.ramkumar', 'MLA',
   'Ward 103, Zone Annanagar', 'Anna Nagar',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/986d0feb95dc9ca216e2905bd24024fba9285947.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-104-mla', 'ward-104', 'V.k.ramkumar', 'MLA',
   'Ward 104, Zone Annanagar', 'Anna Nagar',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/986d0feb95dc9ca216e2905bd24024fba9285947.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-105-mla', 'ward-105', 'V.k.ramkumar', 'MLA',
   'Ward 105, Zone Annanagar', 'Anna Nagar',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/986d0feb95dc9ca216e2905bd24024fba9285947.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-106-mla', 'ward-106', 'V.k.ramkumar', 'MLA',
   'Ward 106, Zone Annanagar', 'Anna Nagar',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/986d0feb95dc9ca216e2905bd24024fba9285947.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-107-mla', 'ward-107', 'Rajmohan', 'MLA',
   'Ward 107, Zone Annanagar', 'Egmore',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/e29819ca1417db52d247984510ab7d6fad0b18b8.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-108-mla', 'ward-108', 'V.k.ramkumar', 'MLA',
   'Ward 108, Zone Annanagar', 'Anna Nagar',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/986d0feb95dc9ca216e2905bd24024fba9285947.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-109-mla', 'ward-109', 'Prabhakar.j.c.d', 'MLA',
   'Ward 109, Zone Teynampet', 'Thousand Lights',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/67021768ab4f2137463669db5a4455aa805d8243.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-110-mla', 'ward-110', 'Prabhakar.j.c.d', 'MLA',
   'Ward 110, Zone Teynampet', 'Thousand Lights',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/67021768ab4f2137463669db5a4455aa805d8243.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-111-mla', 'ward-111', 'Prabhakar.j.c.d', 'MLA',
   'Ward 111, Zone Teynampet', 'Thousand Lights',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/67021768ab4f2137463669db5a4455aa805d8243.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-112-mla', 'ward-112', 'Prabhakar.j.c.d', 'MLA',
   'Ward 112, Zone Teynampet', 'Thousand Lights',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/67021768ab4f2137463669db5a4455aa805d8243.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-113-mla', 'ward-113', 'Prabhakar.j.c.d', 'MLA',
   'Ward 113, Zone Teynampet', 'Thousand Lights',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/67021768ab4f2137463669db5a4455aa805d8243.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-114-mla', 'ward-114', 'Udhayanidhi Stalin', 'MLA',
   'Ward 114, Zone Teynampet', 'Chepauk-Thiruvalliken',
   'DMK', '#e3000f', 'https://myneta.info/images_candidate/TamilNadu2026/c0c41a47841fa08beb31c788e651e810ef397e41.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-115-mla', 'ward-115', 'Udhayanidhi Stalin', 'MLA',
   'Ward 115, Zone Teynampet', 'Chepauk-Thiruvalliken',
   'DMK', '#e3000f', 'https://myneta.info/images_candidate/TamilNadu2026/c0c41a47841fa08beb31c788e651e810ef397e41.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-116-mla', 'ward-116', 'Udhayanidhi Stalin', 'MLA',
   'Ward 116, Zone Teynampet', 'Chepauk-Thiruvalliken',
   'DMK', '#e3000f', 'https://myneta.info/images_candidate/TamilNadu2026/c0c41a47841fa08beb31c788e651e810ef397e41.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-117-mla', 'ward-117', 'Prabhakar.j.c.d', 'MLA',
   'Ward 117, Zone Teynampet', 'Thousand Lights',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/67021768ab4f2137463669db5a4455aa805d8243.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-118-mla', 'ward-118', 'Prabhakar.j.c.d', 'MLA',
   'Ward 118, Zone Teynampet', 'Thousand Lights',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/67021768ab4f2137463669db5a4455aa805d8243.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-119-mla', 'ward-119', 'Udhayanidhi Stalin', 'MLA',
   'Ward 119, Zone Teynampet', 'Chepauk-Thiruvalliken',
   'DMK', '#e3000f', 'https://myneta.info/images_candidate/TamilNadu2026/c0c41a47841fa08beb31c788e651e810ef397e41.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-120-mla', 'ward-120', 'Udhayanidhi Stalin', 'MLA',
   'Ward 120, Zone Teynampet', 'Chepauk-Thiruvalliken',
   'DMK', '#e3000f', 'https://myneta.info/images_candidate/TamilNadu2026/c0c41a47841fa08beb31c788e651e810ef397e41.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-121-mla', 'ward-121', 'Venkataramanan. P.', 'MLA',
   'Ward 121, Zone Teynampet', 'Mylapore',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/b08353cdad60c8a78fadbcf6fa319c2add067484.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-122-mla', 'ward-122', 'Venkataramanan. P.', 'MLA',
   'Ward 122, Zone Teynampet', 'Mylapore',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/b08353cdad60c8a78fadbcf6fa319c2add067484.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-123-mla', 'ward-123', 'Venkataramanan. P.', 'MLA',
   'Ward 123, Zone Teynampet', 'Mylapore',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/b08353cdad60c8a78fadbcf6fa319c2add067484.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-124-mla', 'ward-124', 'Venkataramanan. P.', 'MLA',
   'Ward 124, Zone Teynampet', 'Mylapore',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/b08353cdad60c8a78fadbcf6fa319c2add067484.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-125-mla', 'ward-125', 'Venkataramanan. P.', 'MLA',
   'Ward 125, Zone Teynampet', 'Mylapore',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/b08353cdad60c8a78fadbcf6fa319c2add067484.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-126-mla', 'ward-126', 'Venkataramanan. P.', 'MLA',
   'Ward 126, Zone Teynampet', 'Mylapore',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/b08353cdad60c8a78fadbcf6fa319c2add067484.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-127-mla', 'ward-127', 'Sabarinathan R.', 'MLA',
   'Ward 127, Zone Kodambakkam', 'Virugampakkam',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/22809fae237362c065957f03cced95221aace65d.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-128-mla', 'ward-128', 'Sabarinathan R.', 'MLA',
   'Ward 128, Zone Kodambakkam', 'Virugampakkam',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/22809fae237362c065957f03cced95221aace65d.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-129-mla', 'ward-129', 'Sabarinathan R.', 'MLA',
   'Ward 129, Zone Kodambakkam', 'Virugampakkam',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/22809fae237362c065957f03cced95221aace65d.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-130-mla', 'ward-130', 'Anand N.', 'MLA',
   'Ward 130, Zone Kodambakkam', 'Thiyagarayanagar',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/599420d3af433e5733b098311466bab28c029ef2.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-131-mla', 'ward-131', 'Sabarinathan R.', 'MLA',
   'Ward 131, Zone Kodambakkam', 'Virugampakkam',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/22809fae237362c065957f03cced95221aace65d.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-132-mla', 'ward-132', 'Anand N.', 'MLA',
   'Ward 132, Zone Kodambakkam', 'Thiyagarayanagar',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/599420d3af433e5733b098311466bab28c029ef2.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-133-mla', 'ward-133', 'Anand N.', 'MLA',
   'Ward 133, Zone Kodambakkam', 'Thiyagarayanagar',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/599420d3af433e5733b098311466bab28c029ef2.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-134-mla', 'ward-134', 'Anand N.', 'MLA',
   'Ward 134, Zone Kodambakkam', 'Thiyagarayanagar',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/599420d3af433e5733b098311466bab28c029ef2.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-135-mla', 'ward-135', 'Anand N.', 'MLA',
   'Ward 135, Zone Kodambakkam', 'Thiyagarayanagar',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/599420d3af433e5733b098311466bab28c029ef2.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-136-mla', 'ward-136', 'Anand N.', 'MLA',
   'Ward 136, Zone Kodambakkam', 'Thiyagarayanagar',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/599420d3af433e5733b098311466bab28c029ef2.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-137-mla', 'ward-137', 'Sabarinathan R.', 'MLA',
   'Ward 137, Zone Kodambakkam', 'Virugampakkam',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/22809fae237362c065957f03cced95221aace65d.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-138-mla', 'ward-138', 'Sabarinathan R.', 'MLA',
   'Ward 138, Zone Kodambakkam', 'Virugampakkam',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/22809fae237362c065957f03cced95221aace65d.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-139-mla', 'ward-139', 'Arul Prakasam. M.', 'MLA',
   'Ward 139, Zone Kodambakkam', 'Saidapet',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/5d1dcd5cd014b229d6054755eadce071622e58f2.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-140-mla', 'ward-140', 'Arul Prakasam. M.', 'MLA',
   'Ward 140, Zone Kodambakkam', 'Saidapet',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/5d1dcd5cd014b229d6054755eadce071622e58f2.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-141-mla', 'ward-141', 'Prabhakar.j.c.d', 'MLA',
   'Ward 141, Zone Kodambakkam', 'Thousand Lights',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/67021768ab4f2137463669db5a4455aa805d8243.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-142-mla', 'ward-142', 'Arul Prakasam. M.', 'MLA',
   'Ward 142, Zone Kodambakkam', 'Saidapet',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/5d1dcd5cd014b229d6054755eadce071622e58f2.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-143-mla', 'ward-143', 'Rhevanth Charan', 'MLA',
   'Ward 143, Zone Valasaravakkam', 'Maduravoyal',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/c7df7f1f391154922b516ee116c6c72105af9c1b.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-144-mla', 'ward-144', 'Rhevanth Charan', 'MLA',
   'Ward 144, Zone Valasaravakkam', 'Maduravoyal',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/c7df7f1f391154922b516ee116c6c72105af9c1b.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-145-mla', 'ward-145', 'Rhevanth Charan', 'MLA',
   'Ward 145, Zone Valasaravakkam', 'Maduravoyal',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/c7df7f1f391154922b516ee116c6c72105af9c1b.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-146-mla', 'ward-146', 'Rhevanth Charan', 'MLA',
   'Ward 146, Zone Valasaravakkam', 'Maduravoyal',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/c7df7f1f391154922b516ee116c6c72105af9c1b.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-147-mla', 'ward-147', 'Rhevanth Charan', 'MLA',
   'Ward 147, Zone Valasaravakkam', 'Maduravoyal',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/c7df7f1f391154922b516ee116c6c72105af9c1b.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-148-mla', 'ward-148', 'Rhevanth Charan', 'MLA',
   'Ward 148, Zone Valasaravakkam', 'Maduravoyal',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/c7df7f1f391154922b516ee116c6c72105af9c1b.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-149-mla', 'ward-149', 'Rhevanth Charan', 'MLA',
   'Ward 149, Zone Valasaravakkam', 'Maduravoyal',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/c7df7f1f391154922b516ee116c6c72105af9c1b.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-150-mla', 'ward-150', 'Rhevanth Charan', 'MLA',
   'Ward 150, Zone Valasaravakkam', 'Maduravoyal',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/c7df7f1f391154922b516ee116c6c72105af9c1b.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-151-mla', 'ward-151', 'Rhevanth Charan', 'MLA',
   'Ward 151, Zone Valasaravakkam', 'Maduravoyal',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/c7df7f1f391154922b516ee116c6c72105af9c1b.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-152-mla', 'ward-152', 'Rhevanth Charan', 'MLA',
   'Ward 152, Zone Valasaravakkam', 'Maduravoyal',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/c7df7f1f391154922b516ee116c6c72105af9c1b.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-153-mla', 'ward-153', 'M.harish', 'MLA',
   'Ward 153, Zone Valasaravakkam', 'Alandur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/b49a4199a00dbdf617845b9de8f700e6b976c561.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-154-mla', 'ward-154', 'Rhevanth Charan', 'MLA',
   'Ward 154, Zone Valasaravakkam', 'Maduravoyal',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/c7df7f1f391154922b516ee116c6c72105af9c1b.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-155-mla', 'ward-155', 'Rhevanth Charan', 'MLA',
   'Ward 155, Zone Valasaravakkam', 'Maduravoyal',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/c7df7f1f391154922b516ee116c6c72105af9c1b.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-156-mla', 'ward-156', 'M.harish', 'MLA',
   'Ward 156, Zone Alandur', 'Alandur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/b49a4199a00dbdf617845b9de8f700e6b976c561.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-157-mla', 'ward-157', 'M.harish', 'MLA',
   'Ward 157, Zone Alandur', 'Alandur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/b49a4199a00dbdf617845b9de8f700e6b976c561.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-158-mla', 'ward-158', 'M.harish', 'MLA',
   'Ward 158, Zone Alandur', 'Alandur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/b49a4199a00dbdf617845b9de8f700e6b976c561.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-159-mla', 'ward-159', 'M.harish', 'MLA',
   'Ward 159, Zone Alandur', 'Alandur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/b49a4199a00dbdf617845b9de8f700e6b976c561.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-160-mla', 'ward-160', 'M.harish', 'MLA',
   'Ward 160, Zone Alandur', 'Alandur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/b49a4199a00dbdf617845b9de8f700e6b976c561.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-161-mla', 'ward-161', 'M.harish', 'MLA',
   'Ward 161, Zone Alandur', 'Alandur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/b49a4199a00dbdf617845b9de8f700e6b976c561.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-162-mla', 'ward-162', 'M.harish', 'MLA',
   'Ward 162, Zone Alandur', 'Alandur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/b49a4199a00dbdf617845b9de8f700e6b976c561.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-163-mla', 'ward-163', 'M.harish', 'MLA',
   'Ward 163, Zone Alandur', 'Alandur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/b49a4199a00dbdf617845b9de8f700e6b976c561.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-164-mla', 'ward-164', 'M.harish', 'MLA',
   'Ward 164, Zone Alandur', 'Alandur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/b49a4199a00dbdf617845b9de8f700e6b976c561.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-165-mla', 'ward-165', 'M.harish', 'MLA',
   'Ward 165, Zone Alandur', 'Alandur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/b49a4199a00dbdf617845b9de8f700e6b976c561.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-166-mla', 'ward-166', 'M.harish', 'MLA',
   'Ward 166, Zone Alandur', 'Alandur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/b49a4199a00dbdf617845b9de8f700e6b976c561.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-167-mla', 'ward-167', 'M.harish', 'MLA',
   'Ward 167, Zone Alandur', 'Alandur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/b49a4199a00dbdf617845b9de8f700e6b976c561.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-168-mla', 'ward-168', 'M.harish', 'MLA',
   'Ward 168, Zone Perungudi', 'Alandur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/b49a4199a00dbdf617845b9de8f700e6b976c561.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-169-mla', 'ward-169', 'Ecr P. Saravanan', 'MLA',
   'Ward 169, Zone Perungudi', 'Shozhinganallur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/f44511973882465a5549707c1bfa9a8322d4ae5d.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-170-mla', 'ward-170', 'Arul Prakasam. M.', 'MLA',
   'Ward 170, Zone Adyar', 'Saidapet',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/5d1dcd5cd014b229d6054755eadce071622e58f2.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-171-mla', 'ward-171', 'Arul Prakasam. M.', 'MLA',
   'Ward 171, Zone Adyar', 'Saidapet',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/5d1dcd5cd014b229d6054755eadce071622e58f2.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-172-mla', 'ward-172', 'Arul Prakasam. M.', 'MLA',
   'Ward 172, Zone Adyar', 'Saidapet',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/5d1dcd5cd014b229d6054755eadce071622e58f2.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-173-mla', 'ward-173', 'Venkataramanan. P.', 'MLA',
   'Ward 173, Zone Adyar', 'Mylapore',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/b08353cdad60c8a78fadbcf6fa319c2add067484.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-174-mla', 'ward-174', 'Arul Prakasam. M.', 'MLA',
   'Ward 174, Zone Adyar', 'Saidapet',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/5d1dcd5cd014b229d6054755eadce071622e58f2.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-175-mla', 'ward-175', 'Kumar. R.', 'MLA',
   'Ward 175, Zone Adyar', 'Velachery',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/6f54ff627719b81f391bfb056ab8380ecd0a4ad5.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-176-mla', 'ward-176', 'Kumar. R.', 'MLA',
   'Ward 176, Zone Adyar', 'Velachery',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/6f54ff627719b81f391bfb056ab8380ecd0a4ad5.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-177-mla', 'ward-177', 'Kumar. R.', 'MLA',
   'Ward 177, Zone Adyar', 'Velachery',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/6f54ff627719b81f391bfb056ab8380ecd0a4ad5.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-178-mla', 'ward-178', 'Kumar. R.', 'MLA',
   'Ward 178, Zone Adyar', 'Velachery',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/6f54ff627719b81f391bfb056ab8380ecd0a4ad5.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-179-mla', 'ward-179', 'Kumar. R.', 'MLA',
   'Ward 179, Zone Adyar', 'Velachery',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/6f54ff627719b81f391bfb056ab8380ecd0a4ad5.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-180-mla', 'ward-180', 'Kumar. R.', 'MLA',
   'Ward 180, Zone Adyar', 'Velachery',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/6f54ff627719b81f391bfb056ab8380ecd0a4ad5.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-181-mla', 'ward-181', 'Kumar. R.', 'MLA',
   'Ward 181, Zone Adyar', 'Velachery',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/6f54ff627719b81f391bfb056ab8380ecd0a4ad5.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-182-mla', 'ward-182', 'Kumar. R.', 'MLA',
   'Ward 182, Zone Adyar', 'Velachery',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/6f54ff627719b81f391bfb056ab8380ecd0a4ad5.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-183-mla', 'ward-183', 'Ecr P. Saravanan', 'MLA',
   'Ward 183, Zone Perungudi', 'Shozhinganallur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/f44511973882465a5549707c1bfa9a8322d4ae5d.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-184-mla', 'ward-184', 'Ecr P. Saravanan', 'MLA',
   'Ward 184, Zone Perungudi', 'Shozhinganallur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/f44511973882465a5549707c1bfa9a8322d4ae5d.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-185-mla', 'ward-185', 'Ecr P. Saravanan', 'MLA',
   'Ward 185, Zone Perungudi', 'Shozhinganallur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/f44511973882465a5549707c1bfa9a8322d4ae5d.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-186-mla', 'ward-186', 'Ecr P. Saravanan', 'MLA',
   'Ward 186, Zone Perungudi', 'Shozhinganallur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/f44511973882465a5549707c1bfa9a8322d4ae5d.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-187-mla', 'ward-187', 'Ecr P. Saravanan', 'MLA',
   'Ward 187, Zone Perungudi', 'Shozhinganallur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/f44511973882465a5549707c1bfa9a8322d4ae5d.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-188-mla', 'ward-188', 'Ecr P. Saravanan', 'MLA',
   'Ward 188, Zone Perungudi', 'Shozhinganallur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/f44511973882465a5549707c1bfa9a8322d4ae5d.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-189-mla', 'ward-189', 'Ecr P. Saravanan', 'MLA',
   'Ward 189, Zone Perungudi', 'Shozhinganallur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/f44511973882465a5549707c1bfa9a8322d4ae5d.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-190-mla', 'ward-190', 'Ecr P. Saravanan', 'MLA',
   'Ward 190, Zone Perungudi', 'Shozhinganallur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/f44511973882465a5549707c1bfa9a8322d4ae5d.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-191-mla', 'ward-191', 'Ecr P. Saravanan', 'MLA',
   'Ward 191, Zone Perungudi', 'Shozhinganallur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/f44511973882465a5549707c1bfa9a8322d4ae5d.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-192-mla', 'ward-192', 'Ecr P. Saravanan', 'MLA',
   'Ward 192, Zone Sozhinganallur', 'Shozhinganallur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/f44511973882465a5549707c1bfa9a8322d4ae5d.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-193-mla', 'ward-193', 'Ecr P. Saravanan', 'MLA',
   'Ward 193, Zone Sozhinganallur', 'Shozhinganallur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/f44511973882465a5549707c1bfa9a8322d4ae5d.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-194-mla', 'ward-194', 'Ecr P. Saravanan', 'MLA',
   'Ward 194, Zone Sozhinganallur', 'Shozhinganallur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/f44511973882465a5549707c1bfa9a8322d4ae5d.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-195-mla', 'ward-195', 'Ecr P. Saravanan', 'MLA',
   'Ward 195, Zone Sozhinganallur', 'Shozhinganallur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/f44511973882465a5549707c1bfa9a8322d4ae5d.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-196-mla', 'ward-196', 'Ecr P. Saravanan', 'MLA',
   'Ward 196, Zone Sozhinganallur', 'Shozhinganallur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/f44511973882465a5549707c1bfa9a8322d4ae5d.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-197-mla', 'ward-197', 'Ecr P. Saravanan', 'MLA',
   'Ward 197, Zone Sozhinganallur', 'Shozhinganallur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/f44511973882465a5549707c1bfa9a8322d4ae5d.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-198-mla', 'ward-198', 'Ecr P. Saravanan', 'MLA',
   'Ward 198, Zone Sozhinganallur', 'Shozhinganallur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/f44511973882465a5549707c1bfa9a8322d4ae5d.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-199-mla', 'ward-199', 'Ecr P. Saravanan', 'MLA',
   'Ward 199, Zone Sozhinganallur', 'Shozhinganallur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/f44511973882465a5549707c1bfa9a8322d4ae5d.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone'),
  ('rep-ward-200-mla', 'ward-200', 'Ecr P. Saravanan', 'MLA',
   'Ward 200, Zone Sozhinganallur', 'Shozhinganallur',
   'TVK', '#d97706', 'https://myneta.info/images_candidate/TamilNadu2026/f44511973882465a5549707c1bfa9a8322d4ae5d.jpg',
   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone')
on conflict (id) do update set
  ward_id = excluded.ward_id,
  name = excluded.name,
  role = excluded.role,
  area = excluded.area,
  constituency = excluded.constituency,
  party = excluded.party,
  party_color = excluded.party_color,
  photo_url = excluded.photo_url,
  email = excluded.email,
  helpline = excluded.helpline,
  office_hours = excluded.office_hours,
  preferred_channel = excluded.preferred_channel,
  updated_at = now();
