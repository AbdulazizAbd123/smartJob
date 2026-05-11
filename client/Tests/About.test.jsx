import { describe, it, expect } from "vitest"; // Import necessary testing functions from Vitest
import { render, screen } from "@testing-library/react"; // Import the renderand screen function from React Testing Library to render React components in a test environment
import About from "../src/Components/About"; // Import the About component to be tested
import React from "react"; // Import React to support JSX syntax
import "@testing-library/jest-dom";

import { add, greet } from "../src/Components/About";

describe("About", () => {
  //test case1
  it("should render the About component", () => {
    render(<About />); // Render the About component in the virtual DOM provided by the testing library
    //Assertion: check if there is an h1 element
    const aboutElement = screen.getByRole("heading", { level: 1 });
    expect(aboutElement).toBeInTheDocument();
  });

  //test case2
  it("should have the text about", () => {
    render(<About />);
    const text = screen.queryByText(/about/i); //exactly "about"
    //const text = screen.queryByText(/about/i); //will look for "about"
    expect(text).toBeInTheDocument();
  });

  //test case3
  it("should have the image", () => {
    render(<About />);
    const image = screen.getByAltText("devimage");
    expect(image).toHaveClass("userImage");
  });

  //test case4
  //describe("add()", () => {
  it("should add two numbers", () => {
    expect(add(2, 3)).toBe(5);
  });
  //});

  //test case5
  describe("greet()", () => {
    it("returns a greeting message", () => {
      expect(greet("Abdulaziz")).toBe("Hello, Abdulaziz!");
    });
  });

  //test case6
  it("should show the project overview section", () => {
    render(<About />);
    const overview = screen.getByRole("heading", { name: /project overview/i });
    expect(overview).toBeInTheDocument();
  });

  //test case7
  it("should show project purpose", () => {
    render(<About />);
    const purpose = screen.getByText(/job seekers apply for available jobs/i);
    expect(purpose).toBeInTheDocument();
  });

  //test case8
  it("should show developed by text", () => {
    render(<About />);
    const developedBy = screen.getByText(/developed by/i);
    expect(developedBy).toBeInTheDocument();
  });

  //test case9
  it("should show both developer names", () => {
    render(<About />);
    expect(screen.getByText(/Abdulaziz Abdullah Alshehhi/i)).toBeInTheDocument();
    expect(screen.getByText(/Yousef Albarami/i)).toBeInTheDocument();
  });

  //test case10
  it("should show both university IDs", () => {
    render(<About />);
    expect(screen.getByText(/University ID: 66S2142/i)).toBeInTheDocument();
    expect(screen.getByText(/University ID: 66J214/i)).toBeInTheDocument();
  });

  //test case11
  it("should show both university emails", () => {
    render(<About />);
    expect(screen.getByText(/66S2142@utas.edu.om/i)).toBeInTheDocument();
    expect(screen.getByText(/66J214@utas.edu.om/i)).toBeInTheDocument();
  });
});
