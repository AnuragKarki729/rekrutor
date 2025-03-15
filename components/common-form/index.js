import { Button } from "../ui/button";
import { Box, TextField, MenuItem } from '@mui/material';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import React, { useState, useEffect } from "react";

const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  // Generate years from 1950 to current year
  for (let year = currentYear; year >= 1950; year--) {
    years.push(year);
  }
  return years;
};

function CommonForm({ action, buttonText, isBtnDisabled, formControls, btnType, formData, setFormData, handleFileChange }) {
  const [skillInputValue, setSkillInputValue] = useState('');
  const [linkInputValue, setLinkInputValue] = useState('');

  useEffect(() => {
    if (formData.previousCompanies?.length) {
      const calculateTotalExperience = () => {
        const totalYears = formData.previousCompanies.reduce((total, company) => {
          if (!company.startDate || !company.endDate) return total;

          const start = new Date(company.startDate);
          const end = new Date(company.endDate);
          const years = (end - start) / (1000 * 60 * 60 * 24 * 365.25);

          return total + Math.max(0, years);
        }, 0);

        return totalYears.toFixed(1);
      };

      const totalExp = calculateTotalExperience();
      if (formData.totalExperience !== totalExp) {
        setFormData(prev => ({
          ...prev,
          totalExperience: totalExp
        }));
      }
    }
  }, [formData.previousCompanies]);

  const handleSubmit = (e) => {
    e.preventDefault();
    action();
  };

  function renderInputByComponentType(getCurrentControl) {
    switch (getCurrentControl.componentType) {
      case "input":
        if (getCurrentControl.showWhen && !getCurrentControl.showWhen(formData)) {
          return null;
        }
        return (
          <Box className="mt-6 mb-6">
            <TextField
              fullWidth
              label={getCurrentControl.label}
              variant="outlined"
              type={getCurrentControl.type || "text"}
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
            />
          </Box>
        );

      case "select":
        if (getCurrentControl.showWhen && !getCurrentControl.showWhen(formData)) {
          return null;
        }

        return (
          <Box className="mt-6 mb-6">
            <TextField
              select
              fullWidth
              label={getCurrentControl.label}
              variant="outlined"
              name={getCurrentControl.name}
              value={formData[getCurrentControl.name] || ""}
              disabled={getCurrentControl.disabled}
              onChange={(event) => {
                const newValue = event.target.value;
                setFormData({
                  ...formData,
                  [event.target.name]: newValue,
                  ...(event.target.name === 'experience' && newValue === 'Fresher'
                    ? { yearsOfExperience: '', industry: '', previousCompanies: [] }
                    : {})
                });
              }}
            >
              {getCurrentControl.options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        );

      case 'selectJob':
        if (getCurrentControl.showWhen && !getCurrentControl.showWhen(formData)) {
          return null;
        }
        return (
          <Box className="mt-6 mb-6 flex justify-center">
            <Select
              key={getCurrentControl.name}
              onValueChange={(value) => setFormData({ ...formData, [getCurrentControl.name]: value })}
              value={formData[getCurrentControl.name] || ''}
            >
              <SelectTrigger className="w-[400px] h-[56px] px-4 text-base bg-white items-center justify-center rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <SelectValue placeholder={getCurrentControl.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {getCurrentControl.options.map((option) => (
                  <SelectItem
                    key={option}
                    value={option}
                    className="text-base"
                  >
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Box>
        );

      case "number":
        if (getCurrentControl.showWhen && !getCurrentControl.showWhen(formData)) {
          return null;
        }
        return (
          <Box className="mt-6 mb-6">
            <TextField
              
              fullWidth
              type="number"
              label={getCurrentControl.label}
              variant="outlined"
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
            />
          </Box>
        );

      case "totalExperience":
        return (
          <Box className="mt-6 mb-6">
            <TextField
              fullWidth
              type="text"
              label="Total Experience"
              variant="outlined"
              


              disabled={true}
              name={getCurrentControl.name}
              id={getCurrentControl.name}
              value={`${formData.totalExperience || "0"} years`}
            />
          </Box>
        );

        case "links":
          if (getCurrentControl.showWhen && !getCurrentControl.showWhen(formData)) {
            return null;
          }
          return (
            <div className="mt-6 mb-6">
              <Box className="mt-6 mb-6">
                <TextField
                  fullWidth
                  type="text"
                  label={getCurrentControl.label}
                  variant="outlined"
                  placeholder={getCurrentControl.placeholder}
                  value={linkInputValue}
                  onChange={(event) => {
                    const input = event.target.value;
                    if (input.endsWith(',')) {
                      const newLink = input.slice(0, -1).trim();
                      if (newLink) {
                        // Get existing links, handling both array and string formats
                        const existingLinks = Array.isArray(formData[getCurrentControl.name])
                          ? formData[getCurrentControl.name]
                          : formData[getCurrentControl.name]
                            ? formData[getCurrentControl.name].split(', ')
                            : [];
                        
                        // Add new link to existing links
                        const updatedLinks = [...existingLinks, newLink];
                        
                        setFormData({
                          ...formData,
                          [getCurrentControl.name]: updatedLinks
                        });
                        setLinkInputValue('');
                      }
                    } else {
                      setLinkInputValue(input);
                    }
                  }}
                />
                <div className="text-sm text-gray-500 mb-2 text-center mt-2 mb-4">
                  Press <span className="inline-flex items-center bg-gray-100 px-2 py-1 rounded-md font-mono">⌘ / Ctrl ,</span> to add new link
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(Array.isArray(formData[getCurrentControl.name])
                    ? formData[getCurrentControl.name]
                    : formData[getCurrentControl.name]
                      ? formData[getCurrentControl.name].split(', ')
                      : []
                  ).map((link, index) => (
                    <div
                      key={index}
                      className="flex bg-blue-100 rounded-md px-3 py-1 justify-center items-center"
                    >
                      <a 
                        href={link.startsWith('http') ? link : `https://${link}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {link}
                      </a>
                      <button
                        type="button"
                        className="ml-2 text-gray-500 hover:text-gray-700"
                        onClick={() => {
                          const currentLinks = Array.isArray(formData[getCurrentControl.name])
                            ? formData[getCurrentControl.name]
                            : formData[getCurrentControl.name].split(', ');
                          const newLinks = currentLinks.filter((_, i) => i !== index);
                          setFormData({
                            ...formData,
                            [getCurrentControl.name]: newLinks
                          });
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </Box>
            </div>
          );
  

      case "skills":
        if (getCurrentControl.showWhen && !getCurrentControl.showWhen(formData)) {
          return null;
        }
        return (
          <div className="mt-6 mb-6">
            <Box className="mt-6 mb-6">
              <TextField
                fullWidth
                type="text"
                label={getCurrentControl.label}
                variant="outlined"
                placeholder={getCurrentControl.placeholder}
                value={skillInputValue}
                onChange={(event) => {
                  const input = event.target.value;
                  if (input.endsWith(',')) {
                    const newSkill = input.slice(0, -1).trim();
                    if (newSkill) {
                      // Get existing skills by splitting the string
                      const existingSkills = formData[getCurrentControl.name]
                        ? formData[getCurrentControl.name].split(', ')
                        : [];
                      
                      // Add new skill to existing skills
                      const updatedSkills = [...existingSkills, newSkill];
                      
                      // Convert back to string
                      setFormData({
                        ...formData,
                        [getCurrentControl.name]: updatedSkills.join(', ')
                      });
                      setSkillInputValue('');
                    }
                  } else {
                    setSkillInputValue(input);
                  }
                }}
              />
              <div className="text-sm text-gray-500 mb-2 text-center mt-2 mb-4">
                Press <span className="inline-flex items-center bg-gray-100 px-2 py-1 rounded-md font-mono">⌘ / Ctrl ,</span> to add new skill
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(formData[getCurrentControl.name]
                  ? formData[getCurrentControl.name].split(', ')
                  : []
                ).map((skill, index) => (
                  <div
                    key={index}
                    className="flex bg-green-100 rounded-md px-3 py-1 justify-center"
                  >
                    {skill}
                    <button
                      type="button"
                      className="ml-2 text-gray-500 hover:text-gray-700"
                      onClick={() => {
                        const currentSkills = formData[getCurrentControl.name].split(', ');
                        const newSkills = currentSkills.filter((_, i) => i !== index);
                        setFormData({
                          ...formData,
                          [getCurrentControl.name]: newSkills.join(', ')
                        });
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </Box>
          </div>
        );

      case "year":
        if (getCurrentControl.showWhen && !getCurrentControl.showWhen(formData)) {
          return null;
        }
        return (
          <Box className="mt-6 mb-6">
            <TextField
              select
              fullWidth
              label={getCurrentControl.label}
              variant="outlined"
              name={getCurrentControl.name}
              value={formData[getCurrentControl.name] || ""}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  [event.target.name]: event.target.value,
                })
              }
            >
              {generateYearOptions().map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        );

      case "file":
        return (
          <Box className="mt-6 mb-6">
            <label
              htmlFor={getCurrentControl.name}
              className="block text-sm font-medium text-gray-700"
            >
              Upload your resume | <span className="text-gray-400 text-sm"> You can sign up without a resume.</span>
            </label>
            <input
              id={getCurrentControl.name}
              type="file"
              accept=".pdf"
              onChange={(event) => {
                if (event.target.files && event.target.files.length > 0) {
                  const selectedFile = event.target.files[0];
                  setFormData((prev) => ({
                    ...prev,
                    [getCurrentControl.name]: selectedFile.name,
                  }));
                  handleFileChange(event);
                }
              }}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-gray-300 file:bg-white file:text-sm file:font-medium"
              disabled={getCurrentControl.disabled}
            />
          </Box>
        );

      case "jobDescriptionFile":
        return (
          <Box className="mt-6 mb-6">
            <label
                htmlFor={getCurrentControl.name}
                className="block text-sm font-medium text-gray-700"
              >
                Upload your Job File | <span className="text-gray-400 text-sm"> Fast Track your job posting</span>
              </label>
              <input
                id={getCurrentControl.name}
                type="file"
                accept=".pdf"
                onChange={(event) => {
                  if (event.target.files && event.target.files.length > 0) {
                    const selectedFile = event.target.files[0];
                    setFormData((prev) => ({
                      ...prev,
                      [getCurrentControl.name]: selectedFile.name,
                    }));
                    handleFileChange(event);
                  }
                }}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-gray-300 file:bg-white file:text-sm file:font-medium"
                disabled={getCurrentControl.disabled}
              />
            </Box>
          );
      case "previousCompanies":
        if (getCurrentControl.showWhen && !getCurrentControl.showWhen(formData)) {
          return null;
        }
        return (
          <Box className="mt-6 mb-6">
            {(formData.previousCompanies || []).map((company, index) => (
              <Box key={index} className="flex items-center gap-4 mb-4">
                <TextField
                  label="Company Name"
                  variant="outlined"
                  value={company.companyName || ""}
                  onChange={(event) => {
                    const newCompanies = [...(formData.previousCompanies || [])];
                    newCompanies[index] = { ...newCompanies[index], companyName: event.target.value };

                    setFormData({
                      ...formData,
                      previousCompanies: newCompanies,
                    });
                  }}
                  sx={{ flex: 2 }}
                />

                <TextField
                  label="Position"
                  variant="outlined"
                  value={company.position || ""}
                  onChange={(event) => {
                    const newCompanies = [...(formData.previousCompanies || [])];
                    newCompanies[index] = { ...newCompanies[index], position: event.target.value };
                    setFormData({
                      ...formData,
                      previousCompanies: newCompanies,
                    });
                  }}
                  sx={{ flex: 2 }}
                />

                <div className="flex items-center gap-2" style={{ flex: 2 }}>
                  <TextField
                    type="date"
                    label="Start Date"
                  
                    variant="outlined"
                    value={company.startDate ? new Date(company.startDate).toISOString().split('T')[0] : ""}

                    onChange={(event) => {
                      const newCompanies = [...(formData.previousCompanies || [])];
                      newCompanies[index] = {...newCompanies[index], startDate: new Date(event.target.value)};
                      setFormData({
                        ...formData,
                        previousCompanies: newCompanies,
                      });
                    }}
                    sx={{ width: '45%' }}
                  />
                  <TextField
                    type="date"
                    label="End Date"
                    variant="outlined"
                    value={company.endDate ? new Date(company.endDate).toISOString().split('T')[0] : ""}
                    

                    onChange={(event) => {
                      const newCompanies = [...(formData.previousCompanies || [])];
                      newCompanies[index] = {
                        ...newCompanies[index],
                        endDate: new Date(event.target.value)
                      };
                      setFormData({
                        ...formData,
                        previousCompanies: newCompanies,
                      });
                    }}
                    sx={{ width: '45%' }}
                  />
                </div>

                <Button
                  type="button"
                  onClick={() => {
                    const newCompanies = formData.previousCompanies.filter((_, i) => i !== index);
                    setFormData({
                      ...formData,
                      previousCompanies: newCompanies,
                    });
                  }}
                  className="text-red-500 hover:text-red-700"
                  sx={{ minWidth: '40px', padding: '8px' }}
                >
                  ×
                </Button>
              </Box>
            ))}

            <Button
              type="button"
              onClick={() => {
                setFormData({
                  ...formData,
                  previousCompanies: [
                    ...(formData.previousCompanies || []),
                    { name: "", position: "", startDate: "", endDate: "" }
                  ],
                });
              }}
              className="mt-2 text-green-600 hover:text-green-800"
              sx={{ minWidth: '40px', padding: '8px' }}
            >
              + Work Experience
            </Button>
          </Box>
        );

      
      default:
        if (getCurrentControl.showWhen && !getCurrentControl.showWhen(formData)) {
          return null;
        }
        return (
          <Box className="mt-6 mb-6">
            <TextField
              fullWidth
              label={getCurrentControl.label}
              variant="outlined"
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

            />
          </Box>
        );
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {formControls.map((control) => (
          <div key={control.name || control.id}>
            {renderInputByComponentType(control)}
          </div>
        ))}

        <div className="mt-6 w-full flex justify-center">
          <Button
            type={btnType || "submit"}

            className="w-1/2 rounded-md h-[60px] border-2 border-gray-900 px-4 bg-indigo-600 text-white text-lg font-semibold transition-all duration-200 ease-in-out hover:bg-indigo-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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