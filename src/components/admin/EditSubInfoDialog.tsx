
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type EditSubInfoDialogProps = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  subInfoValue: string;
  setSubInfoValue: (v: string) => void;
  onSave: () => void;
  loading: boolean;
};

const EditSubInfoDialog: React.FC<EditSubInfoDialogProps> = ({
  open,
  onOpenChange,
  subInfoValue,
  setSubInfoValue,
  onSave,
  loading,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Sub Information</DialogTitle>
          <DialogDescription className="text-gray-400">
            Add or update sub information for this content.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={subInfoValue}
          onChange={(e) => setSubInfoValue(e.target.value)}
          className="bg-slate-700 border-slate-600 text-white"
          rows={4}
          placeholder="Enter sub information"
          disabled={loading}
        />
        <div className="flex gap-2 justify-end">
          <Button
            onClick={onSave}
            className="bg-orange-500 hover:bg-orange-600"
            disabled={loading}
            type="button"
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditSubInfoDialog;
