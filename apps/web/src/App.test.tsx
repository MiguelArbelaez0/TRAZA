import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("TRAZA - interfaz principal", () => {
  it("muestra el dashboard inicial", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: /hola, bienvenido a traza/i })
    ).toBeInTheDocument();
  });

  it("permite navegar a Mi perfil", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /^mi perfil$/i }));

    expect(
      screen.getAllByRole("heading", { name: /mi perfil profesional/i })[0]
    ).toBeInTheDocument();
  });

  it("permite buscar experiencias", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /^experiencias$/i }));
    await user.type(
      screen.getByPlaceholderText(/buscar experiencias/i),
      "aplicación móvil"
    );

    expect(
      screen.getByText("Desarrollo de aplicación móvil")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Plataforma de gestión de transacciones")
    ).not.toBeInTheDocument();
  });

  it("permite agregar una experiencia", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /^experiencias$/i }));
    await user.click(screen.getByRole("button", { name: /nueva experiencia/i }));

    await user.type(
      screen.getByPlaceholderText("Ej. Aplicación de gestión"),
      "Proyecto de prueba automatizada"
    );
    await user.type(
      screen.getByPlaceholderText("Ej. Proyecto académico"),
      "TRAZA QA"
    );

    await user.click(screen.getByRole("button", { name: /^agregar$/i }));

    expect(
      screen.getByText("Proyecto de prueba automatizada")
    ).toBeInTheDocument();
  });

  it("permite agregar una competencia", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /^competencias$/i }));
    await user.click(screen.getByRole("button", { name: /nueva competencia/i }));

    await user.type(
      screen.getByPlaceholderText("Ej. Comunicación técnica"),
      "Pruebas automatizadas"
    );

    await user.click(screen.getByRole("button", { name: /^agregar$/i }));

    expect(screen.getByText("Pruebas automatizadas")).toBeInTheDocument();
  });

  it("muestra la sección de evidencias", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /^evidencias/i }));

    expect(
      screen.getByRole("heading", { name: /pruebas de tus logros/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Código fuente de un proyecto")
    ).toBeInTheDocument();
  });
});
