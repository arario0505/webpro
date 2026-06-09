
-- Delete existing courses for the computer science department
DELETE FROM courses WHERE department_id = (SELECT id FROM departments WHERE name = '컴퓨터공학과');

-- Update department credit requirements
UPDATE departments SET 
  total_credits_required = 130,
  major_required_credits = 30,
  major_elective_credits = 36,
  general_required_credits = 17,
  general_elective_credits = 15,
  free_elective_credits = 32
WHERE name = '컴퓨터공학과';

-- Insert accurate 2025 curriculum data
-- 1학년 1학기
INSERT INTO courses (course_code, course_name, credits, course_type, target_year, target_semester, department_id, description) VALUES
('LR101', '진로설계(신입생)', 1, '교양필수', 1, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Career Path Design for Freshmen'),
('LC101', '고급프로그래밍언어활용', 3, '교양필수', 1, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Application of Advanced Programming Language'),
('LC102', '미적분학1', 3, '교양필수', 1, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Calculus 1'),
('MC101', 'C프로그래밍및실습', 3, '전공필수', 1, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'C Programming and Lab'),
('MC102', '확률및통계', 3, '전공필수', 1, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Probability and Statistics');

-- 1학년 2학기
INSERT INTO courses (course_code, course_name, credits, course_type, target_year, target_semester, department_id, description) VALUES
('LR102', '전공탐색(신입생)', 1, '교양필수', 1, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Exploring Majors for Freshmen'),
('LC103', '인공지능과빅데이터', 3, '교양필수', 1, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Artificial Intelligence and Big Data'),
('MC103', '공학수학1', 3, '전공필수', 1, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Mathematics for Engineers 1'),
('MC104', '고급C프로그래밍및실습', 3, '전공필수', 1, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Advanced C Programming and Lab'),
('MC105', '선형대수', 3, '전공필수', 1, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Linear Algebra');

-- 2학년 1학기
INSERT INTO courses (course_code, course_name, credits, course_type, target_year, target_semester, department_id, description) VALUES
('MR201', '자료구조및실습', 3, '전공필수', 2, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Data Structure and Lab'),
('MR202', '디지털시스템', 3, '전공필수', 2, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Digital System'),
('ME201', '문제해결및실습:C++', 3, '전공선택', 2, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Problem Solving and Lab: C++'),
('ME202', '웹프로그래밍', 3, '전공선택', 2, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Web Programming'),
('ME203', '윈도우즈프로그래밍', 3, '전공선택', 2, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Windows Programming'),
('ME204', 'K-MOOC:기계학습입문', 3, '전공선택', 2, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'K-MOOC: Introduction to Machine Learning'),
('ME205', '산업체인턴(설계)', 3, '전공선택', 2, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Industrial Internship (Design)');

-- 2학년 2학기
INSERT INTO courses (course_code, course_name, credits, course_type, target_year, target_semester, department_id, description) VALUES
('MR203', '알고리즘및실습', 3, '전공필수', 2, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Algorithms and Lab'),
('ME206', '컴퓨터구조', 3, '전공선택', 2, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Computer Architecture'),
('ME207', '이산수학및프로그래밍', 3, '전공선택', 2, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Discrete Mathematics and Programming'),
('ME208', '문제해결및실습:Java', 3, '전공선택', 2, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Problem Solving and Lab: Java'),
('ME209', 'K-MOOC:멀티미디어', 3, '전공선택', 2, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'K-MOOC: Multimedia'),
('ME210', '오픈소스SW입문', 3, '전공선택', 2, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Introduction to Open Source Software');

-- 3학년 1학기
INSERT INTO courses (course_code, course_name, credits, course_type, target_year, target_semester, department_id, description) VALUES
('MR301', '운영체제', 3, '전공필수', 3, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Operating System'),
('ME301', '데이터베이스', 3, '전공선택', 3, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Database'),
('ME302', '컴퓨터그래픽스', 3, '전공선택', 3, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Computer Graphics'),
('ME303', '신호및시스템', 3, '전공선택', 3, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Signals and Systems'),
('ME304', '프로그래밍언어론', 3, '전공선택', 3, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Introduction to Programming Language'),
('ME305', 'C#프로그래밍', 3, '전공선택', 3, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'C# Programming'),
('ME306', '마이크로컴퓨터', 3, '전공선택', 3, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Micro Computer'),
('ME307', '오픈소스SW공학', 3, '전공선택', 3, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Engineering to Open Source Software'),
('ME308', '첨단기술콜로키움1', 1, '전공선택', 3, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Advanced Technologies Colloquium 1'),
('ME309', '딥러닝', 3, '전공선택', 3, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Deep Learning'),
('ME310', 'AI와윤리', 3, '전공선택', 3, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'AI and Ethics'),
('ME311', '메타버스시스템', 3, '전공선택', 3, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Metaverse System');

-- 3학년 2학기
INSERT INTO courses (course_code, course_name, credits, course_type, target_year, target_semester, department_id, description) VALUES
('MR302', '컴퓨터네트워크', 3, '전공필수', 3, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Computer Networks'),
('ME312', '디지털신호처리', 3, '전공선택', 3, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Digital Signal Processing'),
('ME313', '소프트웨어공학', 3, '전공선택', 3, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Software Engineering'),
('ME314', '리눅스프로그래밍및실습', 3, '전공선택', 3, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Linux Programming and Lab'),
('ME315', 'XML프로그래밍', 3, '전공선택', 3, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'XML Programming'),
('ME316', '고급프로그래밍설계', 3, '전공선택', 3, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Advanced Programming Design'),
('ME317', '웹기반시스템', 3, '전공선택', 3, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Web-based System'),
('ME318', '통신시스템', 3, '전공선택', 3, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Communication Systems'),
('ME319', '멀티코어프로그래밍', 3, '전공선택', 3, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Multi-core Programming'),
('ME320', '인공지능', 3, '전공선택', 3, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Artificial Intelligence'),
('ME321', '첨단기술콜로키움2', 1, '전공선택', 3, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Advanced Technologies Colloquium 2'),
('ME322', '자연어처리', 3, '전공선택', 3, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Natural Language Processing'),
('ME323', '고성능AI프로그래밍', 3, '전공선택', 3, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'High-performance AI Programming'),
('ME324', '메타버스데이터처리', 3, '전공선택', 3, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Metaverse Data Processing'),
('ME325', '블록체인', 3, '전공선택', 3, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Blockchain'),
('ME326', 'AI네트워킹', 3, '전공선택', 3, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'AI Networking');

-- 4학년 1학기
INSERT INTO courses (course_code, course_name, credits, course_type, target_year, target_semester, department_id, description) VALUES
('MR401', '캡스톤디자인(종합설계)', 6, '전공필수', 4, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Capstone Design (Senior Project)'),
('MR402', 'SW-AI설계', 1, '전공필수', 4, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'SW-AI Design'),
('ME401', '자기주도학습및진로개발/종합설계', 1, '전공선택', 4, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Independent Study and Career Skills / Senior Project'),
('ME402', '영상처리', 3, '전공선택', 4, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Image Processing'),
('ME403', '지능형엣지시스템', 3, '전공선택', 4, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Intelligent Edge System'),
('ME404', '정보보호개론', 3, '전공선택', 4, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Introduction to Information Security'),
('ME405', '지능형네트워크프로그래밍', 3, '전공선택', 4, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Intelligent Network Programming'),
('ME406', '무선통신', 3, '전공선택', 4, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Wireless Communication'),
('ME407', '인간-AI상호작용', 3, '전공선택', 4, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Human-AI Interaction'),
('ME408', '패턴인식', 3, '전공선택', 4, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Pattern Recognition'),
('ME409', 'AI소프트웨어특론', 3, '전공선택', 4, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Special Topics in AI Software'),
('ME410', '첨단기술콜로키움3', 1, '전공선택', 4, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Advanced Technologies Colloquium 3'),
('ME411', '지능시스템특론1', 3, '전공선택', 4, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Special Topics in Intelligent System 1'),
('ME412', 'K-MOOC:생성형AI입문', 3, '전공선택', 4, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'K-MOOC: Introduction to Generative AI'),
('ME413', '특허와창업', 3, '전공선택', 4, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Patent and Foundation');

-- 4학년 2학기
INSERT INTO courses (course_code, course_name, credits, course_type, target_year, target_semester, department_id, description) VALUES
('ME414', '자기주도학습및진로개발/종합설계', 1, '전공선택', 4, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Independent Study and Career Skills / Senior Project'),
('ME415', '지능형앱프로그래밍', 3, '전공선택', 4, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Intelligent App Programming'),
('ME416', 'AI시스템', 3, '전공선택', 4, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'AI System'),
('ME417', '지능형데이터마이닝', 3, '전공선택', 4, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Intelligent Data Mining'),
('ME418', '컴파일러', 3, '전공선택', 4, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Compilers'),
('ME419', '컴퓨터비전', 3, '전공선택', 4, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Computer Vision'),
('ME420', 'AI소프트웨어특론2', 3, '전공선택', 4, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Special Topics in AI Software 2'),
('ME421', '가상현실', 3, '전공선택', 4, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Virtual Reality'),
('ME422', '첨단기술콜로키움4', 1, '전공선택', 4, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Advanced Technologies Colloquium 4'),
('ME423', '지능시스템특론2', 3, '전공선택', 4, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Special Topics in Intelligent System 2'),
('ME424', '강화학습', 3, '전공선택', 4, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Reinforcement Learning'),
('ME425', '객체지향설계', 3, '전공선택', 4, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Object-Oriented Design');

-- 교양필수 추가 (2학년)
INSERT INTO courses (course_code, course_name, credits, course_type, target_year, target_semester, department_id, description) VALUES
('LR201', '한국어와문학1', 3, '교양필수', 2, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Korean Language and Literature 1'),
('LR202', '서양철학의이해', 3, '교양필수', 2, 1, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Introduction to Western Philosophy'),
('LR203', '한국어와문학2', 3, '교양필수', 2, 2, (SELECT id FROM departments WHERE name = '컴퓨터공학과'), 'Korean Language and Literature 2');
