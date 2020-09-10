import { truncate } from "lodash";
import React, { cloneElement, FC, useEffect, useState } from "react";
import { Button, Dropdown, Grid, Icon, Label, Modal } from "semantic-ui-react";

import { Confirm } from "../../../components/Confirm";
import {
  AllUsersAdminDocument,
  useAllProgramsAdminQuery,
  useUpdateUserProgramsAdminMutation,
} from "../../../graphql";

export const UpdatePrograms: FC<{
  program: { email: string; programs: string[] };
  children: JSX.Element;
}> = ({ children, program }) => {
  const [open, setOpen] = useState(false);

  const { data: allPrograms } = useAllProgramsAdminQuery();

  const [selectedPrograms, setSelectedPrograms] = useState(program.programs);

  useEffect(() => {
    setSelectedPrograms(program.programs);
  }, [program.programs]);

  const [updateProgram] = useUpdateUserProgramsAdminMutation({
    update: (cache, { data }) => {
      if (data?.updateUserPrograms) {
        cache.writeQuery({
          query: AllUsersAdminDocument,
          data: {
            users: data.updateUserPrograms,
          },
        });
      }
    },
    variables: {
      userPrograms: {
        email: program.email,
        oldPrograms: program.programs,
        programs: selectedPrograms,
      },
    },
  });

  const deletePrograms = () => {
    updateProgram({
      variables: {
        userPrograms: {
          email: program.email,
          oldPrograms: program.programs,
          programs: [],
        },
      },
    });
  };

  return (
    <Modal
      trigger={cloneElement(children, {
        onClick: () => setOpen(true),
      })}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      open={open}
    >
      <Modal.Header>
        {program.email}
        {program.programs.length > 0 ? "-" : ""}
        {truncate(program.programs.join(" | "), { length: 50 })}
      </Modal.Header>

      <Modal.Content>
        <Grid centered>
          <Grid.Row>
            <Confirm
              header="Are you sure you want to reset all the form fields?"
              content="Any changes in those fields will be lost"
            >
              <Button
                circular
                icon
                secondary
                onClick={() => {
                  setSelectedPrograms(program.programs);
                }}
              >
                <Icon circular name="redo" />
              </Button>
            </Confirm>
          </Grid.Row>
          <Grid.Row>
            <Label size="big">{program.email}</Label>
          </Grid.Row>
          <Grid.Row>
            <Label size="big">Programs</Label>
            <Dropdown
              placeholder="Add programs"
              fluid
              selection
              multiple
              search
              options={
                allPrograms?.programs.map(({ id: value }) => ({
                  text: value,
                  value,
                })) ?? []
              }
              onChange={(_, { value }) =>
                setSelectedPrograms(value as string[])
              }
              value={selectedPrograms}
            />
          </Grid.Row>
        </Grid>
      </Modal.Content>
      <Modal.Actions>
        <Button
          type="submit"
          icon
          labelPosition="left"
          primary
          onClick={() => {
            updateProgram();
            setOpen(false);
          }}
        >
          <Icon name="save outline" />
          Save
        </Button>

        <Confirm header="Are you sure you want to remove all the programs of this user?">
          <Button
            type="button"
            icon
            labelPosition="left"
            color="red"
            onClick={() => {
              deletePrograms();
              setOpen(false);
            }}
          >
            <Icon name="remove circle" />
            Remove
          </Button>
        </Confirm>
      </Modal.Actions>
    </Modal>
  );
};