import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

function CommonForm({
  action,
  buttonText,
  isBtnDisabled,
  formControls,
  btnType,
  formData,
  setFormData,
  handleFileChange,
}) {
  function renderInputByComponentType(getCurrentControl) {
    switch (getCurrentControl.componentType) {
      case "input":
        return (
          <div className="relative flex items-center mt-8">
            <Input
              type={getCurrentControl.type || "text"}
              disabled={getCurrentControl.disabled}
              placeholder={getCurrentControl.placeholder}
              name={getCurrentControl.name}
              id={getCurrentControl.name}
              value={formData[getCurrentControl.name] || ""} // Handle undefined values
              onChange={(event) =>
                setFormData({
                  ...formData,
                  [event.target.name]: event.target.value,
                })
              }
              className="w-full rounded-md h-[60px] px-4 bg-gray-100 text-lg outline-none drop-shadow-sm transition-all duration-200 ease-in-out focus:bg-white focus:drop-shadow-lg focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        );

      case "file":
        return (
          <div className="mt-6">
            <Label htmlFor={getCurrentControl.name} className="block text-sm font-medium text-gray-700">
              {getCurrentControl.label}
            </Label>
            <div className="relative flex items-center">
              {/* File input */}
              <Input
                id={getCurrentControl.name}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(event) => {
                  if (event.target.files && event.target.files.length > 0) {
                    const selectedFile = event.target.files[0];
                    // Update form data with the file name
                    setFormData((prev) => ({
                      ...prev,
                      [getCurrentControl.name]: selectedFile.name,
                    }));
                    // Pass file to the handler
                    handleFileChange(event);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {/* Styled container for displaying file name */}
              <div className="flex flex-grow items-center border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
                <span className="truncate text-gray-600">
                  {formData[getCurrentControl.name] || "No file chosen"}
                </span>
              </div>
            </div>
          </div>
        );

      default:
        // Default to a text input if the componentType is not specified or recognized
        return (
          <div className="relative flex items-center mt-8">
            <Input
              type="text"
              disabled={getCurrentControl.disabled}
              placeholder={getCurrentControl.placeholder}
              name={getCurrentControl.name}
              id={getCurrentControl.name}
              value={formData[getCurrentControl.name] || ""}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  [event.target.name]: event.target.value,
                })
              }
              className="w-full rounded-md h-[60px] px-4 bg-gray-100 text-lg outline-none drop-shadow-sm transition-all duration-200 ease-in-out focus:bg-white focus:drop-shadow-lg focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        );
    }
  }

  return (
    <div>
      <form action={action}>
        {formControls.map((control) => (
          <div key={control.name || control.id}>
            {renderInputByComponentType(control)}
          </div>
        ))}

        <div className="mt-6 w-full">
          <Button
            type={btnType || "submit"}
            className="disabled:opacity-60 flex h-11 items-center justify-center px-5"
            disabled={isBtnDisabled}
          >
            {buttonText}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CommonForm;
