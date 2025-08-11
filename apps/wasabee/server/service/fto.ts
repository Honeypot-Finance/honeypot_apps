import { MUBAI_FTO_PAIR_ABI } from '@/lib/abis/ftoPair';
import { MemePairABI } from '@/lib/abis/MemePair';
import { chainsMap } from '@honeypot/shared/config/chains/chainBaseConfig';
import { createPublicClientByChain } from '@/lib/client';
import { pg } from '@/lib/db';
import DataLoader from 'dataloader';

const super_api_key = process.env.FTO_API_KEY ?? '';

const fto_api_key_list = [
  'b3a3a02a-a665-4fb5-bb17-153d05863efe', //bera boyz
];

const fotProjectDataloader = new DataLoader(
  async (pairs: readonly { pair: string; chain_id: string }[]) => {
    //重构下使sql能根据pair和chain_id批量查询,pair和chain_id是联合主键,这种不行
    const res = await pg<
      projectColumn[]
    >`select * from fto_project where (pair, chain_id) in (select pair, chain_id from (values ${pg(
      pairs.map(({ pair, chain_id }) => [pair, chain_id])
    )}) as t(pair, chain_id))`;
    const projectMap = res.reduce((acc, project) => {
      acc[`${project.pair}-${project.chain_id}`] = project;
      return acc;
    }, {} as Record<string, projectColumn>);
    return pairs.map(({ pair, chain_id }) => projectMap[`${pair}-${chain_id}`]);
  },
  {
    maxBatchSize: 100,
    cache: false,
  }
);

interface projectColumn {
  id: number;
  twitter?: string;
  telegram?: string;
  website?: string;
  description?: string;
  logo_url?: string;
  name?: string;
  provider?: string;
  project_type: 'meme' | 'fto' | null;
  banner_url?: string;
  beravote_space_id?: string;
  launch_token?: string;
  raising_token?: string;
  pair: string;
  creator_api_key?: string;
  chain_id: number;
}

export const ftoService = {
  createFtoProject: async (data: {
    pair: string;
    provider: string;
    chain_id: number;
    creator_api_key?: string;
    project_type?: string;
    projectName: string;
    project_logo?: string;
    banner_url?: string;
    description?: string;
    twitter?: string;
    website?: string;
    telegram?: string;
  }) => {
    await pg`INSERT INTO fto_project ${pg({
      pair: data.pair.toLowerCase(),
      provider: data.provider.toLowerCase(),
      chain_id: data.chain_id,
      // creator_api_key: data.creator_api_key,
      project_type: data.project_type ?? '',
      name: data.projectName,
      logo_url: data.project_logo ?? '',
      banner_url: data.banner_url ?? '',
      description: data.description ?? '',
      twitter: data.twitter ?? '',
      website: data.website ?? '',
      telegram: data.telegram ?? '',
    })}`;
  },

  getProjectInfo: async (data: {
    pair: string;
    chain_id: number;
    creator_api_key?: string;
  }) => {
    let project = await fotProjectDataloader.load({
      pair: data.pair,
      chain_id: data.chain_id.toString(),
    });
    let updateFlag = false;
    const publicClient = createPublicClientByChain(chainsMap[data.chain_id]);
    const readQueue = [];
    if (!project || !project.provider) {
      project = {
        id: -8888,
        pair: data.pair,
        chain_id: data.chain_id,
        provider: '',
        project_type: null,
      };
      console.log(
        'project not found, need to create',
        data.pair,
        data.chain_id
      );
      updateFlag = true;
      readQueue.push(
        publicClient
          .readContract({
            address: data.pair as `0x${string}`,
            abi: MUBAI_FTO_PAIR_ABI,
            functionName: 'launchedTokenProvider',
          })
          .catch(() => {
            return '';
          })
          .then((provider) => {
            if (provider) {
              project.provider = provider;
              project.project_type = 'fto';
            }
          }),
        publicClient
          .readContract({
            address: data.pair as `0x${string}`,
            abi: MemePairABI.abi,
            functionName: 'tokenDeployer',
          })
          .catch(() => {
            return '';
          })
          .then((provider) => {
            if (provider) {
              project.provider = provider;
              project.project_type = 'meme';
            }
          })
      );
    }

    await Promise.all(readQueue);

    if (updateFlag) {
      console.log('updateFtoProject: ', project);
      await updateFtoProject(project);
    }
    if (project?.creator_api_key) {
      project.creator_api_key = '********';
    }

    return project;
  },
  getFtoProjectsByAccount: async ({
    provider,
    chain_id,
  }: {
    provider: string;
    chain_id: number;
  }) => {
    return pg`SELECT * FROM fto_project WHERE provider = ${provider.toLowerCase()} and chain_id = ${chain_id.toString()} order by id desc`;
  },
  createOrUpdateProjectInfo: async (data: {
    twitter?: string;
    telegram?: string;
    website?: string;
    description?: string;
    projectName?: string;
    pair: string;
    chain_id: number;
    beravote_space_id?: string;
    creator_api_key: string;
    provider?: string;
  }) => {
    if (
      !fto_api_key_list.includes(data.creator_api_key) &&
      data.creator_api_key.toLowerCase() != super_api_key.toLowerCase()
    ) {
      return false;
    }
    try {
      return await updateFtoProject({ ...data });
    } catch (e) {
      console.log('createOrUpdateProjectInfo error: ', e);
      return false;
    }
  },
  createOrUpdateProjectVotes: async (data: {
    project_pair: string;
    wallet_address: string;
    vote: string;
  }) => {
    await pg`INSERT INTO fto_project_vote ${pg({
      project_pair: data.project_pair.toLowerCase(),
      wallet_address: data.wallet_address.toLowerCase(),
      vote: data.vote,
    })} ON CONFLICT (wallet_address, project_pair) DO UPDATE SET vote = ${
      data.vote
    }`;
  },
  updateProjectBanner: async (data: {
    banner_url: string;
    pair: string;
    chain_id: number;
    creator_api_key: string;
  }) => {
    if (
      !fto_api_key_list.includes(data.creator_api_key) &&
      data.creator_api_key.toLowerCase() != super_api_key.toLowerCase()
    ) {
      return;
    }

    await pg`INSERT INTO fto_project ${pg({
      pair: data.pair.toLowerCase(),
      chain_id: data.chain_id,
      banner_url: data.banner_url,
    })} ON CONFLICT (pair, chain_id) DO UPDATE SET banner_url = ${
      data.banner_url
    }`;
  },
  updateFtoLogo: async (data: {
    logo_url: string;
    pair: string;
    chain_id: number;
    creator_api_key: string;
  }) => {
    if (
      !fto_api_key_list.includes(data.creator_api_key) &&
      data.creator_api_key.toLowerCase() != super_api_key.toLowerCase()
    ) {
      return;
    }

    await pg`INSERT INTO fto_project ${pg({
      pair: data.pair.toLowerCase(),
      chain_id: data.chain_id,
      logo_url: data.logo_url,
    })}
    ON CONFLICT (pair, chain_id) DO UPDATE SET logo_url = ${data.logo_url}`;
  },
  getProjectVotes: async (data: {
    pair: string;
  }): Promise<{
    rocket_count: number;
    fire_count: number;
    poo_count: number;
    flag_count: number;
  }> => {
    const res = await pg`SELECT 
    COUNT(CASE WHEN vote = 'rocket' THEN 1 END) AS rocket_count,
    COUNT(CASE WHEN vote = 'fire' THEN 1 END) AS fire_count,
    COUNT(CASE WHEN vote = 'poo' THEN 1 END) AS poo_count,
    COUNT(CASE WHEN vote = 'flag' THEN 1 END) AS flag_count
    FROM public.fto_project_vote
    WHERE project_pair = ${data.pair.toLowerCase()};
  `;
    Object.entries(res[0]).forEach(([key, value]) => {
      res[0][key] = Number(value);
    });

    const outdata = res[0];
    return outdata as any;
  },
  revalidateProject: async (data: {
    pair: string;
    chain_id: number;
    creator_api_key?: string;
  }) => {
    return await revalidateProject(data);
  },
  selectProjectByLaunchToken: async (data: {
    launch_token: string;
    chain_id: number;
  }): Promise<projectColumn[]> => {
    console.log('launch_token', data.launch_token);
    console.log('chain_id', data.chain_id);
    const launch =
      await pg`SELECT * FROM fto_project WHERE launch_token = ${data.launch_token.toLowerCase()} and chain_id = ${data.chain_id.toString()}`;
    return launch.map((item) => {
      return item as projectColumn;
    });
  },
};

const createFtoProject = async (data: {
  pair: string;
  chain_id: number;
  provider?: string;
  creator_api_key: string;
  project_type?: string;
}) => {
  await pg`INSERT INTO fto_project ${pg({
    pair: data.pair.toLowerCase(),
    provider: data.provider?.toLowerCase() ?? '',
    chain_id: data.chain_id,
    creator_api_key: data.creator_api_key,
    project_type: data.project_type ?? null,
  })}`;
};

export const updateFtoProject = async (
  data: Partial<projectColumn> & {
    creator_api_key?: string;
  }
) => {
  try {
    const fieldsToUpdate = Object.entries(data)
      .filter(([key, value]) => {
        if (key === 'creator_api_key') {
          return false;
        }
        return !!value;
      }) // Only include valid values
      .map(([key, value]) => `${key}`);

    //console.log("fieldsToUpdate: ", fieldsToUpdate);

    await pg`
    INSERT INTO fto_project ${pg(data, ...(fieldsToUpdate as any))} 
    ON CONFLICT (pair, chain_id) DO UPDATE SET ${pg(
      data,
      ...(fieldsToUpdate as any)
    )} 
  `;

    return true;
  } catch (e) {
    console.log('updateFtoProject error: ', e);
    return false;
  }
};

const revalidateProject = async (data: {
  pair: string;
  chain_id: number;
  creator_api_key?: string;
}) => {
  const res = await fotProjectDataloader.load({
    pair: data.pair,
    chain_id: data.chain_id.toString(),
  });

  const publicClient = createPublicClientByChain(chainsMap[data.chain_id]);

  if (!res) {
    //create
    let provider = '';
    let project_type = 'fto';

    const memePairContract = {
      address: data.pair as `0x${string}`,
      abi: MemePairABI.abi,
    };

    const ftoPairContract = {
      address: data.pair as `0x${string}`,
      abi: MUBAI_FTO_PAIR_ABI,
    };

    await publicClient
      .readContract({
        ...ftoPairContract,
        functionName: 'launchedTokenProvider',
      })
      .then((data: string) => {
        console.log('data: ', data);
        provider = data.toLowerCase();
      })
      .catch((e) => {
        console.log('ftoPairContract error', e);
        project_type = 'meme';
      });

    if (!provider) {
      await publicClient
        .readContract({ ...memePairContract, functionName: 'memeToken' })
        .then((data) => {
          console.log('data: ', data);
          provider = data.toLowerCase();
        })
        .catch((e) => {
          console.log('memePairContract error', e);
          project_type = '';
        });
    }

    // if (!provider) {
    //   return null;
    // }

    await createFtoProject({
      pair: data.pair,
      chain_id: data.chain_id,
      provider: provider ?? '',
      creator_api_key: data.creator_api_key ?? super_api_key,
      project_type: project_type,
    });

    return fotProjectDataloader.load({
      pair: data.pair,
      chain_id: data.chain_id.toString(),
    });
  } else {
    //revalidate
    let needUpdate = false;
    let project_type = res.project_type;
    let provider = res.provider;

    if (!project_type || !project_type || !provider || provider == '') {
      needUpdate = true;
      project_type = 'fto';

      const memePairContract = {
        address: data.pair as `0x${string}`,
        abi: MemePairABI.abi,
      };

      const ftoPairContract = {
        address: data.pair as `0x${string}`,
        abi: MUBAI_FTO_PAIR_ABI,
      };

      await publicClient
        .readContract({
          ...ftoPairContract,
          functionName: 'launchedTokenProvider',
        })
        .then((data: string) => {
          provider = data.toLowerCase();
        })
        .catch(() => {
          project_type = 'meme';
        });

      if (!provider) {
        await publicClient
          .readContract({ ...memePairContract, functionName: 'tokenDeployer' })
          .then((data) => {
            provider = data.toLowerCase();
          })
          .catch(() => {
            project_type = 'fto';
          });
      }

      // if (!provider) {
      //   return null;
      // }
    }

    if (needUpdate) {
      const updateData = {
        pair: data.pair,
        chain_id: data.chain_id,
        creator_api_key: data.creator_api_key ?? super_api_key,
        name: res.name,
        provider: provider,
        project_type: project_type,
      };

      await updateFtoProject(updateData);

      return fotProjectDataloader.load({
        pair: data.pair,
        chain_id: data.chain_id.toString(),
      });
    }
  }
};

const selectFtoProject = async (data: { pair: string; chain_id: number }) => {
  const res = await pg<
    projectColumn[]
  >`SELECT * FROM fto_project WHERE pair = ${data.pair.toLowerCase()} and chain_id = ${
    data.chain_id
  }`;
  console.log('res: ', res);
  return res;
};
