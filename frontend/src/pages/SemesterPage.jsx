// 🔥 SemesterPage.jsx (MINIMAL WORKING VERSION)

import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import axiosInstance from "../services/axiosInstance"

export default function SemesterPage() {
    const { semesterId } = useParams()
    const [courses, setCourses] = useState([])

    useEffect(() => {
        axiosInstance.get("/courses/filter", {
            params: {
                categoryId: 1,      // later e bën dynamic nga student
                semester: semesterId
            }
        })
            .then(res => setCourses(res.data))
            .catch(err => console.log(err))
    }, [semesterId])

    return (
        <div>
            <h2>Semester {semesterId}</h2>

            {courses.map(course => (
                <div key={course.id}>
                    {course.titulli}
                </div>
            ))}
        </div>
    )
}