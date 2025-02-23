import React from 'react';
import Login from './Components/Login';
import LessonPlanGenerator from './Components/LessonPlanGenerator';
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function () {
  return (
    <BrowserRouter>
      <Routes>
        
          <Route path="/" element={<Login />}></Route>
          <Route path="/lessonplanner" element={<LessonPlanGenerator />} />
        
      </Routes>
    </BrowserRouter>
  )
}
