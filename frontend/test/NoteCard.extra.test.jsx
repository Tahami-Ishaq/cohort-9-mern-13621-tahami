import { render, screen } from "@testing-library/react";
import NoteCard from "../src/components/NoteCard";

describe("NoteCard details", () => {
    it("truncates content longer than 150 characters", () => {
        const content = "a".repeat(151);
        render(<NoteCard note={{ id: 1, title: "Long note", content, updated_at: "2026-08-27" }} onEdit={() => {}} onDelete={() => {}} />);

        expect(screen.getByText(`${"a".repeat(150)}...`)).toBeInTheDocument();
        expect(screen.queryByText(content)).not.toBeInTheDocument();
    });
});
