import { Team } from '../entity/Team';
import { User } from '../entity/User';
import { Repository } from 'typeorm';
import validate from '../entity/validation/validate';

class TeamDto {
  constructor(public id: number, public name: string, public amount: number) {}
}

const getAllTeams = async (req, { teamRepository }) => {
  const teams = await teamRepository.find({ relations: ['users'] });

  return {
    body: teams.map(
      (team) => new TeamDto(team.id, team.name, team.users.length),
    ),
  };
};

const getTeamById = async ({ params }, { teamRepository }) => {
  return {
    body: await teamRepository.findOneById(params.id),
  };
};

const updateTeam = async ({ body }, { teamRepository }) => {
  try {
    await validate('updateTeam', body);

    const team = teamRepository.findOneById(body.id);
    team.name = body.teamName;

    await teamRepository.save(team);

    return {
      body: { message: `team id: ${body.id} has new name ${body.teamName}` },
    };
  } catch (error) {
    return {
      status: 400,
      body: { error: error.message },
    };
  }
};

const insertTeam = async ({ body }, { teamRepository }) => {
  try {
    await validate('insertTeam', body);
    await teamRepository.insert({ name: body.teamName });

    const amount = await teamRepository.count();

    return {
      status: 201,
      body: { message: `total amount of teams: ${amount}` },
    };
  } catch (error) {
    return {
      status: 400,
      body: { error: error.message },
    };
  }
};

const deleteTeam = async (
  { params }: any,
  { teamRepository, userRepository }: any,
) => {
  const team = await teamRepository.findOneById(params.id, {
    relations: ['users'],
  });

  await userRepository.removeByIds(team.users.map((user) => user.id));

  return {
    body: await teamRepository.removeById(params.id),
  };
};

export { getAllTeams, getTeamById, updateTeam, insertTeam, deleteTeam };
