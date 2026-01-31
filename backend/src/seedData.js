import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.DATABASE_URL;
const supabaseApiKey = process.env.DATABASE_API_KEY;

export const supabase = createClient(supabaseUrl, supabaseApiKey);

// Dummy data for departments
const departments = [
  { name: "Computer Science and Engineering", abbreviation: "CSE" },
  { name: "Electronics and Communication Engineering", abbreviation: "ECE" },
  { name: "Mechanical Engineering", abbreviation: "ME" },
  { name: "Civil Engineering", abbreviation: "CE" },
  { name: "Electrical Engineering", abbreviation: "EE" },
  { name: "Information Technology", abbreviation: "IT" },
  { name: "Chemical Engineering", abbreviation: "CHE" },
  { name: "Mathematics", abbreviation: "MATH" },
  { name: "Physics", abbreviation: "PHY" },
  { name: "Chemistry", abbreviation: "CHEM" },
];

// Dummy data for courses
const courses = [
  { code: "CS101", name: "Introduction to Programming" },
  { code: "CS201", name: "Data Structures and Algorithms" },
  { code: "CS301", name: "Database Management Systems" },
  { code: "CS302", name: "Operating Systems" },
  { code: "CS401", name: "Machine Learning" },
  { code: "CS402", name: "Artificial Intelligence" },
  { code: "EC101", name: "Digital Electronics" },
  { code: "EC201", name: "Signals and Systems" },
  { code: "EC301", name: "Microprocessors and Microcontrollers" },
  { code: "ME101", name: "Engineering Mechanics" },
  { code: "ME201", name: "Thermodynamics" },
  { code: "ME301", name: "Fluid Mechanics" },
  { code: "CE101", name: "Surveying" },
  { code: "CE201", name: "Structural Analysis" },
  { code: "EE101", name: "Circuit Theory" },
  { code: "EE201", name: "Electrical Machines" },
  { code: "IT101", name: "Web Development" },
  { code: "IT201", name: "Computer Networks" },
  { code: "MATH101", name: "Calculus I" },
  { code: "MATH201", name: "Linear Algebra" },
  { code: "PHY101", name: "Physics I" },
  { code: "CHEM101", name: "Chemistry I" },
];

async function insertDummyData() {
  try {
    console.log("Starting data insertion...\n");

    // 1. Insert departments
    console.log("Inserting departments...");
    const { data: insertedDepartments, error: deptError } = await supabase
      .from("departments")
      .insert(departments)
      .select();

    if (deptError) {
      console.error("Error inserting departments:", deptError);
      return;
    }
    console.log(`✓ Inserted ${insertedDepartments.length} departments\n`);

    // 2. Insert courses
    console.log("Inserting courses...");
    const { data: insertedCourses, error: courseError } = await supabase
      .from("courses")
      .insert(courses)
      .select();

    if (courseError) {
      console.error("Error inserting courses:", courseError);
      return;
    }
    console.log(`✓ Inserted ${insertedCourses.length} courses\n`);

    // 3. Create relationships in provided_by table
    console.log("Creating course-department relationships...");

    const providedBy = [];

    // Map courses to departments based on course codes
    insertedCourses.forEach((course) => {
      const coursePrefix = course.code.match(/^[A-Z]+/)[0];

      let deptAbbr;
      switch (coursePrefix) {
        case "CS":
          deptAbbr = "CSE";
          break;
        case "EC":
          deptAbbr = "ECE";
          break;
        case "ME":
          deptAbbr = "ME";
          break;
        case "CE":
          deptAbbr = "CE";
          break;
        case "EE":
          deptAbbr = "EE";
          break;
        case "IT":
          deptAbbr = "IT";
          break;
        case "MATH":
          deptAbbr = "MATH";
          break;
        case "PHY":
          deptAbbr = "PHY";
          break;
        case "CHEM":
          deptAbbr = "CHEM";
          break;
        default:
          deptAbbr = "CSE"; // Default to CSE
      }

      const department = insertedDepartments.find(
        (d) => d.abbreviation === deptAbbr
      );

      if (department) {
        providedBy.push({
          dept_id: department.id,
          course_id: course.id,
        });
      }
    });

    // Also add some cross-department course offerings (e.g., MATH and PHY courses for engineering depts)
    const mathDept = insertedDepartments.find((d) => d.abbreviation === "MATH");
    const phyDept = insertedDepartments.find((d) => d.abbreviation === "PHY");
    const chemDept = insertedDepartments.find((d) => d.abbreviation === "CHEM");
    const cseDept = insertedDepartments.find((d) => d.abbreviation === "CSE");
    const eceDept = insertedDepartments.find((d) => d.abbreviation === "ECE");

    const mathCourses = insertedCourses.filter((c) =>
      c.code.startsWith("MATH")
    );
    const phyCourses = insertedCourses.filter((c) => c.code.startsWith("PHY"));
    const chemCourses = insertedCourses.filter((c) =>
      c.code.startsWith("CHEM")
    );

    // Add math courses to CSE and ECE departments
    if (mathDept && cseDept) {
      mathCourses.forEach((course) => {
        providedBy.push({ dept_id: cseDept.id, course_id: course.id });
      });
    }

    if (mathDept && eceDept) {
      mathCourses.forEach((course) => {
        providedBy.push({ dept_id: eceDept.id, course_id: course.id });
      });
    }

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
    console.log(`- Departments: ${insertedDepartments.length}`);
    console.log(`- Courses: ${insertedCourses.length}`);
    console.log(`- Relationships: ${insertedProvidedBy.length}`);
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Run the function
insertDummyData();
