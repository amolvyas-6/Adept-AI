import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.DATABASE_URL;
const supabaseApiKey = process.env.DATABASE_API_KEY;

export const supabase = createClient(supabaseUrl, supabaseApiKey);

// Dummy data for universities
const universities = [
  { name: "Indian Institute of Technology Delhi" },
  { name: "National Institute of Technology Karnataka" },
  { name: "Birla Institute of Technology and Science Pilani" },
];

// Departments per university (3 departments each)
const departmentsByUniversity = {
  "Indian Institute of Technology Delhi": [
    { name: "Computer Science and Engineering", abbreviation: "CSE" },
    { name: "Electronics and Communication Engineering", abbreviation: "ECE" },
    { name: "Mechanical Engineering", abbreviation: "ME" },
  ],
  "National Institute of Technology Karnataka": [
    { name: "Computer Science and Engineering", abbreviation: "CSE" },
    { name: "Information Technology", abbreviation: "IT" },
    { name: "Electrical Engineering", abbreviation: "EE" },
  ],
  "Birla Institute of Technology and Science Pilani": [
    { name: "Computer Science and Engineering", abbreviation: "CSE" },
    { name: "Electronics and Communication Engineering", abbreviation: "ECE" },
    { name: "Chemical Engineering", abbreviation: "CHE" },
  ],
};

// Courses per university (5 courses each)
const coursesByUniversity = {
  "Indian Institute of Technology Delhi": [
    { code: "CS101", name: "Introduction to Programming" },
    { code: "CS201", name: "Data Structures and Algorithms" },
    { code: "EC101", name: "Digital Electronics" },
    { code: "ME101", name: "Engineering Mechanics" },
    { code: "MATH101", name: "Calculus I" },
  ],
  "National Institute of Technology Karnataka": [
    { code: "CS101", name: "Introduction to Programming" },
    { code: "CS301", name: "Database Management Systems" },
    { code: "IT101", name: "Web Development" },
    { code: "EE101", name: "Circuit Theory" },
    { code: "MATH101", name: "Calculus I" },
  ],
  "Birla Institute of Technology and Science Pilani": [
    { code: "CS101", name: "Introduction to Programming" },
    { code: "CS401", name: "Machine Learning" },
    { code: "EC201", name: "Signals and Systems" },
    { code: "CHE101", name: "Chemical Process Principles" },
    { code: "MATH201", name: "Linear Algebra" },
  ],
};

// Map course prefix to department abbreviation
function getDeptAbbreviationFromCourseCode(courseCode) {
  const prefix = courseCode.match(/^[A-Z]+/)[0];
  const mapping = {
    CS: "CSE",
    EC: "ECE",
    ME: "ME",
    EE: "EE",
    IT: "IT",
    CHE: "CHE",
    MATH: null, // MATH courses are shared across departments
  };
  return mapping[prefix];
}

async function insertDummyData() {
  try {
    console.log("Starting data insertion...\n");

    // 1. Insert universities
    console.log("Inserting universities...");
    const { data: insertedUniversities, error: uniError } = await supabase
      .from("universities")
      .insert(universities)
      .select();

    if (uniError) {
      console.error("Error inserting universities:", uniError);
      return;
    }
    console.log(`✓ Inserted ${insertedUniversities.length} universities\n`);

    const allDepartments = [];
    const allCourses = [];
    const providedBy = [];

    // 2. Insert departments and courses for each university
    for (const university of insertedUniversities) {
      const uniName = university.name;
      const universityId = university.id;

      // Insert departments for this university
      console.log(`Inserting departments for ${uniName}...`);
      const deptData = departmentsByUniversity[uniName].map((dept) => ({
        ...dept,
        university_id: universityId,
      }));

      const { data: insertedDepts, error: deptError } = await supabase
        .from("departments")
        .insert(deptData)
        .select();

      if (deptError) {
        console.error(`Error inserting departments for ${uniName}:`, deptError);
        return;
      }
      console.log(
        `✓ Inserted ${insertedDepts.length} departments for ${uniName}`
      );
      allDepartments.push(...insertedDepts);

      // Insert courses for this university
      console.log(`Inserting courses for ${uniName}...`);
      const courseData = coursesByUniversity[uniName].map((course) => ({
        ...course,
        university_id: universityId,
      }));

      const { data: insertedCourses, error: courseError } = await supabase
        .from("courses")
        .insert(courseData)
        .select();

      if (courseError) {
        console.error(`Error inserting courses for ${uniName}:`, courseError);
        return;
      }
      console.log(
        `✓ Inserted ${insertedCourses.length} courses for ${uniName}\n`
      );
      allCourses.push(...insertedCourses);

      // Create course-department relationships for this university
      for (const course of insertedCourses) {
        const deptAbbr = getDeptAbbreviationFromCourseCode(course.code);

        if (deptAbbr) {
          // Find the matching department in this university
          const dept = insertedDepts.find((d) => d.abbreviation === deptAbbr);
          if (dept) {
            providedBy.push({ dept_id: dept.id, course_id: course.id });
          }
        }

        // MATH courses are provided by all departments in the university
        if (course.code.startsWith("MATH")) {
          for (const dept of insertedDepts) {
            providedBy.push({ dept_id: dept.id, course_id: course.id });
          }
        }

        // CS101 is a common course provided by CSE and IT/ECE departments
        if (course.code === "CS101") {
          const cseDept = insertedDepts.find((d) => d.abbreviation === "CSE");
          const itDept = insertedDepts.find((d) => d.abbreviation === "IT");
          const eceDept = insertedDepts.find((d) => d.abbreviation === "ECE");

          if (
            itDept &&
            !providedBy.some(
              (p) => p.dept_id === itDept.id && p.course_id === course.id
            )
          ) {
            providedBy.push({ dept_id: itDept.id, course_id: course.id });
          }
          if (
            eceDept &&
            !providedBy.some(
              (p) => p.dept_id === eceDept.id && p.course_id === course.id
            )
          ) {
            providedBy.push({ dept_id: eceDept.id, course_id: course.id });
          }
        }
      }
    }

    // 3. Insert all provided_by relationships
    console.log("Creating course-department relationships...");
    const { data: insertedProvidedBy, error: providedError } = await supabase
      .from("provided_by")
      .insert(providedBy)
      .select();

    if (providedError) {
      console.error(
        "Error inserting provided_by relationships:",
        providedError
      );
      return;
    }
    console.log(
      `✓ Created ${insertedProvidedBy.length} course-department relationships\n`
    );

    console.log("✅ All dummy data inserted successfully!");
    console.log("\nSummary:");
    console.log(`- Universities: ${insertedUniversities.length}`);
    console.log(`- Departments: ${allDepartments.length}`);
    console.log(`- Courses: ${allCourses.length}`);
    console.log(`- Relationships: ${insertedProvidedBy.length}`);
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Run the function
insertDummyData();
